
import { useEffect, useRef, useState } from "react";
import { submitContactForm } from "../api/api";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowUpRight,
  Send,
  MessageCircle,
  Sofa,
  CheckCircle2,
} from "lucide-react";

const contactInfo = [
  // {
  //   icon: MapPin,
  //   title: "Visit Our Showroom",
  //   detail: "Katargam, Surat, Gujarat",
  //   link: "https://www.google.com/maps/search/?api=1&query=Furniture+Showroom+Katargam+Surat",
  //   linkText: "Get Directions",
  // },
  {
    icon: Phone,
    title: "Call Our Team",
    detail: "Add your business phone number",
    link: null,
    linkText: "Contact Details",
  },
  {
    icon: Mail,
    title: "Email Us",
    detail: "Add your business email address",
    link: null,
    linkText: "Email Support",
  },
  {
    icon: Clock,
    title: "Business Hours",
    detail: "Please confirm showroom timings",
    link: null,
    linkText: "Visit Our Store",
  },
];

const inquiryTypes = [
  "Product Inquiry",
  "Price Inquiry",
  "Custom Furniture",
  "Order Support",
  "Delivery Inquiry",
  "Complaint / Feedback",
  "Service Inquiry",
  "Other",
];

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  inquiryType: "",
  productName: "",
  budget: "",
  message: "",
};

const validateForm = (formData) => {
  const errors = {};

  const name = formData.fullName.trim();
  const email = formData.email.trim();
  const phone = formData.phone.trim();
  const productName = formData.productName.trim();
  const message = formData.message.trim();

  if (!name) {
    errors.fullName = "Full name is required.";
  } else if (name.length < 2) {
    errors.fullName = "Name must contain at least 2 characters.";
  } else if (name.length > 100) {
    errors.fullName = "Name cannot exceed 100 characters.";
  } else if (!/^[\p{L}][\p{L}\s.'-]*$/u.test(name)) {
    errors.fullName = "Enter a valid name using letters only.";
  }

  if (!email) {
    errors.email = "Email address is required.";
  } else if (
    email.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
  ) {
    errors.email = "Enter a valid email address.";
  }

  if (!phone) {
    errors.phone = "Phone number is required.";
  } else if (!/^[6-9]\d{9}$/.test(phone)) {
    errors.phone = "Enter a valid 10-digit Indian mobile number.";
  }

  if (!formData.inquiryType) {
    errors.inquiryType = "Please select an inquiry type.";
  } else if (!inquiryTypes.includes(formData.inquiryType)) {
    errors.inquiryType = "Please select a valid inquiry type.";
  }

  if (productName.length > 150) {
    errors.productName = "Product name cannot exceed 150 characters.";
  }

  if (!message) {
    errors.message = "Message is required.";
  } else if (message.length < 10) {
    errors.message = "Message must contain at least 10 characters.";
  } else if (message.length > 2000) {
    errors.message = "Message cannot exceed 2000 characters.";
  }

  return errors;
};

const Contact = () => {
  const [formData, setFormData] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState(false);

  const pageRef = useRef(null);

  // Scroll reveal animation
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const elements = page.querySelectorAll(".contact-reveal");

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) =>
        element.classList.add("contact-visible")
      );
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("contact-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setFieldErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));

    setSubmitMessage("");
    setSubmitError(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitMessage("");
    setSubmitError(false);

    const errors = validateForm(formData);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setSubmitError(true);
      setSubmitMessage("Please correct the errors below.");
      return;
    }

    setIsLoading(true);

    const completeMessage = `
Inquiry Type: ${formData.inquiryType}
Product Interest: ${formData.productName.trim() || "Not specified"}
Budget: ${formData.budget || "Not specified"}

Customer Message:
${formData.message.trim()}
`.trim();

    try {
      const response = await submitContactForm({
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: completeMessage,
      });

      setSubmitMessage(
        response.data?.message ||
          "Your message has been sent successfully!"
      );

      setFormData({ ...initialForm });
      setFieldErrors({});
    } catch (error) {
      setSubmitError(true);

      setSubmitMessage(
        error.response?.data?.message ||
          "Unable to send your message. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full rounded-xl border ${
      fieldErrors[field]
        ? "border-red-500"
        : "border-stone-200/80"
    } bg-white px-4 py-3 text-sm text-stone-800 placeholder-stone-400 outline-none transition focus:border-amber-700/60 focus:ring-2 focus:ring-amber-800/10`;

  const renderError = (field) =>
    fieldErrors[field] ? (
      <p className="mt-1 text-xs text-red-600" role="alert">
        {fieldErrors[field]}
      </p>
    ) : null;

  return (
    <div
      ref={pageRef}
      className="contact-page min-h-screen bg-[#FDFBF7] font-sans text-stone-800"
    >
      <style>{`
        .contact-page {
          animation: contactPageFade 0.7s ease both;
        }

        @keyframes contactPageFade {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .contact-reveal {
          opacity: 0;
          transform: translateY(35px);
          transition:
            opacity 0.8s ease,
            transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .contact-reveal.contact-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .contact-card {
          transition:
            transform 0.35s ease,
            box-shadow 0.35s ease,
            border-color 0.35s ease;
        }

        .contact-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 18px 35px rgba(120, 75, 25, 0.12);
        }

        .contact-card .contact-icon {
          transition:
            transform 0.35s ease,
            background-color 0.35s ease,
            color 0.35s ease;
        }

        .contact-card:hover .contact-icon {
          transform: rotate(-8deg) scale(1.08);
        }

        .contact-page input,
        .contact-page select,
        .contact-page textarea {
          transition: all 0.25s ease;
        }

        .contact-page input:focus,
        .contact-page select:focus,
        .contact-page textarea:focus {
          transform: translateY(-2px);
        }

        .contact-map iframe {
          transition: transform 0.6s ease;
        }

        .contact-map:hover iframe {
          transform: scale(1.025);
        }

        .contact-submit {
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            background-color 0.25s ease;
        }

        .contact-submit:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 10px 22px rgba(120, 53, 15, 0.2);
        }

        @media (prefers-reduced-motion: reduce) {
          .contact-page,
          .contact-reveal,
          .contact-card,
          .contact-page input,
          .contact-page select,
          .contact-page textarea,
          .contact-map iframe,
          .contact-submit {
            animation: none !important;
            transition: none !important;
            transform: none !important;
          }

          .contact-reveal {
            opacity: 1 !important;
          }
        }
      `}</style>

      {/* Hero Section */}
      <section className="contact-reveal border-b border-stone-200/80 bg-amber-100/40 px-6 py-20 text-center">
        <div className="mx-auto max-w-4xl space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-amber-200/60 bg-amber-100/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-900">
            We're Here to Help
          </p>

          <h1 className="font-serif text-4xl font-bold leading-tight tracking-wide text-stone-900 md:text-6xl">
            Let's Talk About <br />
            <span className="text-amber-800">
              Your Dream Space
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">
            Have questions about our furniture? Looking for a custom
            design? Our team is here to help you craft a space that
            feels uniquely yours.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="#contact-form"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-800 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-xs transition-all duration-200 hover:bg-amber-900 active:scale-[0.99]"
            >
              Get in Touch
              <ArrowUpRight size={17} />
            </a>

            
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-medium uppercase tracking-wider text-stone-600">
            <div className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-amber-800" />
              Personal Assistance
            </div>
            <div className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-amber-800" />
              Custom Hardwood Designs
            </div>
          </div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="contact-reveal mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
            Contact Information
          </p>
          <h2 className="font-serif text-3xl font-bold tracking-wide text-stone-900 md:text-4xl">
            We'd Love to Connect
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
            Choose the easiest way to reach us. We are happy to help
            with product details, pricing, and custom furniture requirements.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {contactInfo.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                style={{ transitionDelay: `${index * 100}ms` }}
                className="contact-reveal contact-card rounded-2xl border border-stone-200/80 bg-white p-7 text-left"
              >
                <div className="contact-icon flex h-12 w-12 items-center justify-center rounded-xl border border-amber-200/60 bg-amber-100/70 text-amber-800">
                  <Icon size={22} />
                </div>

                <h3 className="mt-5 font-serif text-lg font-bold text-stone-900">
                  {item.title}
                </h3>

                <p className="mt-2 min-h-12 text-xs leading-relaxed text-stone-600">
                  {item.detail}
                </p>

                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 transition hover:text-amber-900"
                  >
                    {item.linkText}
                    <ArrowUpRight size={15} />
                  </a>
                ) : (
                  <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-wider text-stone-400">
                    {item.linkText}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact Form + Information Panel */}
      <section
        id="contact-form"
        className="border-t border-stone-200/80 bg-white px-6 py-16 md:py-20"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Left Panel */}
          <div className="contact-reveal flex flex-col justify-between rounded-3xl border border-amber-900/10 bg-amber-900 p-8 text-stone-100 shadow-sm sm:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                Get In Touch
              </p>

              <h2 className="mt-4 font-serif text-3xl font-bold leading-tight text-white md:text-4xl">
                Tell Us What You're Looking For.
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-stone-300">
                Whether you need a bespoke sofa for your living room or
                a full hardwood dining setup, share your specifications
                with our studio advisors.
              </p>

              <div className="mt-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-700/60 bg-amber-800/80 text-amber-300">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-white">
                      Product Questions
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-stone-300">
                      Inquire about wood finishes, fabric choices,
                      dimensions, and stock status.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-700/60 bg-amber-800/80 text-amber-300">
                    <Sofa size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-white">
                      Custom Furniture
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-stone-300">
                      Share room measurements, reference images, and
                      material preferences.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-700/60 bg-amber-800/80 text-amber-300">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-white">
                      Order Assistance
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-stone-300">
                      Check your order status, dispatch schedule, and
                      delivery timelines.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-amber-800/80 pt-6">
              <p className="text-xs leading-relaxed text-stone-400">
                Crafted with care in Surat. Every consultation comes
                with direct architectural and material support.
              </p>
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="contact-reveal rounded-3xl border border-stone-200/80 bg-[#FDFBF7] p-8 shadow-xs sm:p-10">
            <h2 className="font-serif text-3xl font-bold tracking-wide text-stone-900">
              Send Us a Message
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Fill in your details below and our showroom team will
              get back to you within 24 hours.
            </p>

            {submitMessage && (
              <div
                role="status"
                aria-live="polite"
                className={`mt-6 flex items-start gap-3 rounded-xl border p-4 text-xs font-medium ${
                  submitError
                    ? "border-red-200 bg-red-50 text-red-900"
                    : "border-emerald-200 bg-emerald-50 text-emerald-900"
                }`}
              >
                {submitError ? (
                  <MessageCircle
                    size={18}
                    className="shrink-0 text-red-700"
                  />
                ) : (
                  <CheckCircle2
                    size={18}
                    className="shrink-0 text-emerald-700"
                  />
                )}
                <p>{submitMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                  >
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    maxLength={100}
                    aria-invalid={Boolean(fieldErrors.fullName)}
                    aria-describedby={
                      fieldErrors.fullName ? "fullName-error" : undefined
                    }
                    className={inputClass("fullName")}
                  />
                  {fieldErrors.fullName && (
                    <p id="fullName-error" className="mt-1 text-xs text-red-600" role="alert">
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                  >
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    maxLength={100}
                    aria-invalid={Boolean(fieldErrors.email)}
                    className={inputClass("email")}
                  />
                  {renderError("email")}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                  >
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    required
                    maxLength={10}
                    aria-invalid={Boolean(fieldErrors.phone)}
                    className={inputClass("phone")}
                  />
                  {renderError("phone")}
                </div>

                <div>
                  <label
                    htmlFor="inquiryType"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                  >
                    Inquiry Type *
                  </label>
                  <select
                    id="inquiryType"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    required
                    aria-invalid={Boolean(fieldErrors.inquiryType)}
                    className={inputClass("inquiryType")}
                  >
                    <option value="">Select category</option>
                    {inquiryTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {renderError("inquiryType")}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="productName"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                  >
                    Product Interest
                  </label>
                  <input
                    id="productName"
                    name="productName"
                    type="text"
                    value={formData.productName}
                    onChange={handleChange}
                    placeholder="e.g. Teak Dining Table"
                    maxLength={150}
                    aria-invalid={Boolean(fieldErrors.productName)}
                    className={inputClass("productName")}
                  />
                  {renderError("productName")}
                </div>

                <div>
                  <label
                    htmlFor="budget"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                  >
                    Budget Range
                  </label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className={inputClass("budget")}
                  >
                    <option value="">Select range (optional)</option>
                    <option value="Under ₹10,000">Under ₹10,000</option>
                    <option value="₹10,000 - ₹25,000">₹10,000 - ₹25,000</option>
                    <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000</option>
                    <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                    <option value="Above ₹1,00,000">Above ₹1,00,000</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                >
                  Your Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Share details about design, finish, dimensions, or questions..."
                  required
                  minLength={10}
                  maxLength={2000}
                  aria-invalid={Boolean(fieldErrors.message)}
                  className={inputClass("message")}
                />
                {renderError("message")}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="contact-submit inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-800 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-all duration-200 hover:bg-amber-900 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Sending Message..." : "Send Message"}
                {!isLoading && <Send size={15} />}
              </button>

              <p className="text-center text-[11px] text-stone-500">
                * All submitted details are handled directly by our CraftStudio team.
              </p>
            </form>
          </div>
        </div>
      </section>

    
      {/* Bottom CTA */}
      <section className="contact-reveal border-t border-stone-200/80 bg-amber-100/40 px-6 py-16 text-center md:py-20">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-amber-200/60 bg-amber-100/70 text-amber-800">
            <Sofa size={24} />
          </div>

          <h2 className="font-serif text-3xl font-bold tracking-wide text-stone-900 md:text-4xl">
            Ready to Furnish Your Space?
          </h2>

          <p className="mx-auto max-w-xl text-sm leading-relaxed text-stone-600 sm:text-base">
            Reach out with your room blueprints or ideas. We'll help you
            select solid wood furniture tailored for your home.
          </p>

          <div className="pt-2">
            <a
              href="#contact-form"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-800 px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-all duration-200 hover:bg-amber-900 active:scale-[0.99]"
            >
              Start Your Inquiry
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
