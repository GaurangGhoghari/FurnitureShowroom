import { useEffect, useState } from "react";
import {
  Star,
  Pencil,
  Trash2,
  Send,
  X,
  Loader2,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  User,
} from "lucide-react";

import {
  getProductReviews,
  addProductReview,
  updateProductReview,
  deleteProductReview,
} from "../../api/api";

import { useAuth } from "../../Context/authcontext";

const Review = ({ productId }) => {
  const { currentUser } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const userId = currentUser?.id ?? currentUser?._id;

  // FETCH PRODUCT REVIEWS
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProductReviews(productId);
      const data = response.data;

      setReviews(data.reviews || []);
      setAverageRating(Number(data.averageRating) || 0);
      setTotalReviews(Number(data.totalReviews) || 0);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load product reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  // RESET FORM
  const resetForm = () => {
    setRating(0);
    setHoverRating(0);
    setReviewText("");
    setEditingId(null);
    setMessage("");
  };

  // ADD OR UPDATE REVIEW
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!currentUser) {
      setError("Please sign in to share your product experience.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Please select a rating score between 1 and 5 stars.");
      return;
    }

    if (!reviewText.trim()) {
      setError("Please write a few words about your experience with this piece.");
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        await updateProductReview(editingId, {
          rating,
          review: reviewText.trim(),
        });

        setMessage("Your review has been updated successfully.");
      } else {
        await addProductReview({
          product_id: productId,
          rating,
          review: reviewText.trim(),
        });

        setMessage("Thank you! Your review has been published.");
      }

      resetForm();
      await fetchReviews();
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong while saving your review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // EDIT REVIEW
  const handleEdit = (item) => {
    setEditingId(item.id);
    setRating(Number(item.rating));
    setReviewText(item.review);
    setMessage("");
    setError("");

    const formElement = document.getElementById("review-form-section");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // DELETE REVIEW
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you wish to delete this review?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await deleteProductReview(id);

      setMessage("Review removed successfully.");
      resetForm();
      await fetchReviews();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete review."
      );
    }
  };

  // STAR RENDERING HELPER
  const renderStars = (value, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = interactive
            ? star <= (hoverRating || rating)
            : star <= value;

          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              onClick={() => interactive && setRating(star)}
              className={`transition-transform ${
                interactive
                  ? "cursor-pointer hover:scale-110 active:scale-95"
                  : "cursor-default"
              }`}
              aria-label={`Rate ${star} stars out of 5`}
            >
              <Star
                size={interactive ? 22 : 15}
                className={`transition-colors duration-150 ${
                  isFilled
                    ? "fill-amber-500 text-amber-500"
                    : "fill-transparent text-stone-300"
                }`}
              />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <section className="mx-auto mt-8 w-full max-w-5xl border-t border-stone-200/80 px-4 pt-8 font-sans text-stone-800">
      {/* SECTION HEADER */}
      <div className="flex flex-col gap-2 border-b border-stone-200/80 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/70 bg-amber-100/80 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-900">
            Customer Feedback
          </span>
          <h2 className="mt-1.5 font-serif text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            Ratings & Reviews
          </h2>
        </div>

        <p className="text-xs font-semibold text-stone-500">
          {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}
        </p>
      </div>

      {/* RATING SUMMARY CARD */}
      <div className="my-5 grid gap-4 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs sm:grid-cols-12 sm:p-5">
        <div className="flex flex-col justify-center sm:col-span-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
            Overall Rating
          </p>

          <div className="mt-1 flex items-baseline gap-3">
            <span className="font-serif text-4xl font-bold tracking-tight text-stone-900">
              {averageRating.toFixed(1)}
            </span>

            <div className="space-y-0.5">
              {renderStars(Math.round(averageRating))}
              <p className="text-[11px] text-stone-500">
                From {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center border-t border-stone-100 pt-3 sm:col-span-7 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/60 bg-amber-50/40 p-3">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-amber-800" />
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-900">
                Verified Feedback
              </h4>
              <p className="mt-0.5 text-xs text-stone-600 leading-snug">
                Customer experiences regarding finish, timber durability, and showroom delivery.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEW FORM SECTION */}
      <div
        id="review-form-section"
        className="mb-8 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-amber-800" />
            <h3 className="font-serif text-lg font-bold text-stone-900">
              {editingId ? "Edit Your Review" : "Write a Review"}
            </h3>
          </div>

          {editingId && (
            <span className="rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-900">
              Editing #{editingId}
            </span>
          )}
        </div>

        {!currentUser ? (
          <div className="rounded-xl border border-dashed border-stone-200 bg-[#FDFBF7] p-5 text-center">
            <p className="text-xs font-medium text-stone-700">
              Please sign in to write a product review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* STAR INPUT */}
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-700">
                Rating *
              </label>

              <div className="inline-flex items-center gap-3 rounded-xl border border-stone-200/80 bg-[#FDFBF7] px-3 py-2">
                {renderStars(rating, true)}
                <span className="text-xs font-medium text-stone-600">
                  {hoverRating || rating
                    ? `${hoverRating || rating}/5`
                    : "Tap to rate"}
                </span>
              </div>
            </div>

            {/* TEXTAREA INPUT */}
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-700">
                Your Review *
              </label>

              <textarea
                rows="3"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your feedback regarding wood quality, comfort, and finish..."
                className="w-full rounded-xl border border-stone-200/90 bg-[#FDFBF7] p-3 text-xs leading-relaxed text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-700 focus:bg-white focus:ring-2 focus:ring-amber-800/10"
              />
            </div>

            {/* FEEDBACK STATUS */}
            {message && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 p-2.5 text-xs font-medium text-emerald-900"
              >
                <CheckCircle2 size={15} className="shrink-0 text-emerald-700" />
                <p>{message}</p>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/80 p-2.5 text-xs font-medium text-rose-900"
              >
                <AlertCircle size={15} className="shrink-0 text-rose-700" />
                <p>{error}</p>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-800 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-2xs transition hover:bg-amber-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    {editingId ? "Update" : "Submit"}
                  </>
                )}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-1 rounded-xl border border-stone-200/80 bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-700 transition hover:bg-stone-50"
                >
                  <X size={13} />
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* REVIEW LIST SECTION */}
      <div>
        <h3 className="mb-4 font-serif text-xl font-bold tracking-tight text-stone-900">
          Client Reviews ({totalReviews})
        </h3>

        {loading ? (
          <div className="py-8 text-center text-xs text-stone-500">
            <Loader2 size={20} className="mx-auto animate-spin text-amber-800" />
            <p className="mt-2">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-200 bg-white/70 py-10 text-center shadow-2xs">
            <Star size={22} className="mx-auto text-amber-400" />
            <h4 className="mt-2 font-serif text-base font-bold text-stone-900">
              No Reviews Yet
            </h4>
            <p className="mt-0.5 text-xs text-stone-500">
              Be the first customer to review this furniture piece.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((item) => {
              const isOwner =
                userId != null &&
                String(item.user_id) === String(userId);

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs transition hover:border-amber-700/30 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200/80 bg-amber-50/70 font-serif text-xs font-bold text-amber-900">
                        <User size={14} />
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-serif text-sm font-bold text-stone-900">
                            Client #{item.user_id}
                          </p>

                          {isOwner && (
                            <span className="rounded-full border border-amber-200/80 bg-amber-100/70 px-2 py-0.2 text-[9px] font-bold uppercase tracking-wider text-amber-900">
                              You
                            </span>
                          )}
                        </div>

                        <div className="mt-0.5 flex items-center gap-1.5">
                          {renderStars(Number(item.rating))}
                          <span className="text-[10px] font-semibold text-stone-400">
                            ({item.rating}.0)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <p className="text-[10px] text-stone-400">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : ""}
                      </p>

                      {isOwner && (
                        <div className="flex items-center gap-1 border-l border-stone-100 pl-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="inline-flex items-center gap-1 rounded-md border border-stone-200/80 bg-white px-2 py-1 text-[11px] font-semibold text-stone-700 hover:border-amber-700/40 hover:text-amber-800"
                          >
                            <Pencil size={11} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-rose-200/80 bg-rose-50/60 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                          >
                            <Trash2 size={11} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="mt-2.5 whitespace-pre-line text-xs leading-relaxed text-stone-700">
                    {item.review}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Review;