const db = require("../db/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        message: "First name, last name, email and password are required",
      });
    }

    db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
      async (error, results) => {
        if (error) {
          console.error("Register database error:", error);
          return res.status(500).json({ message: "Database error" });
        }

        if (results.length > 0) {
          return res.status(409).json({
            message: "Email already registered",
          });
        }

        try {
          const hashedPassword = await bcrypt.hash(password, 10);

          db.query(
            `INSERT INTO users
            (first_name, last_name, email, password)
            VALUES (?, ?, ?, ?)`,
            [first_name, last_name, email, hashedPassword],
            (insertError, result) => {
              if (insertError) {
                console.error("Insert error:", insertError);
                return res.status(500).json({
                  message: "User registration failed",
                });
              }

              return res.status(201).json({
                message: "Registration successful. Please login.",
                user: {
                  id: result.insertId,
                  first_name,
                  last_name,
                  email,
                  role: "user",
                },
              });
            }
          );
        } catch (hashError) {
          console.error("Password hashing error:", hashError);
          return res.status(500).json({
            message: "User registration failed",
          });
        }
      }
    );
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    db.query(
      `SELECT id, first_name, last_name, email, password,
              role, status, profile_image
       FROM users
       WHERE email = ?`,
      [email],
      async (error, results) => {
        if (error) {
          console.error("Login database error:", error);
          return res.status(500).json({ message: "Server error" });
        }

        const user = results[0];

        if (!user) {
          return res.status(401).json({
            message: "Invalid email or password",
          });
        }

        try {
          const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
          );

          if (!isPasswordCorrect) {
            return res.status(401).json({
              message: "Invalid email or password",
            });
          }

          if (user.status === "inactive") {
            return res.status(403).json({
              success: false,
              message: "Your account is inactive. Please contact admin.",
            });
          }

          if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing");
            return res.status(500).json({
              message: "Server configuration error",
            });
          }

          const safeUser = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role || "user",
            profile_image: user.profile_image,
          };

          const token = jwt.sign(safeUser, process.env.JWT_SECRET, {
            expiresIn: "7d",
          });

          res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });

          return res.status(200).json({
            message: "User login successful",
            user: safeUser,
          });
        } catch (loginError) {
          console.error("Login error:", loginError);
          return res.status(500).json({ message: "Login failed" });
        }
      }
    );
  } catch (error) {
    console.error("Login server error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET CURRENT USER AFTER REFRESH
const getCurrentUser = (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      message: "Invalid session. Please login again.",
    });
  }

  db.query(
    `SELECT id, first_name, last_name, email, role,
            phone_number, address1, address2, profile_image
     FROM users
     WHERE id = ?`,
    [userId],
    (error, results) => {
      if (error) {
        console.error("Get current user error:", error);
        return res.status(500).json({
          message: "Failed to get current user",
        });
      }

      const user = results[0];

      if (!user) {
        return res.status(401).json({
          message: "User not found. Please login again.",
        });
      }

      return res.status(200).json({
        success: true,
        user,
      });
    }
  );
};

// UPDATE CURRENT USER PROFILE
const updateUserProfile = (req, res) => {
  const userId = req.user?.id;

  const {
    first_name,
    last_name,
    email,
    phone_number,
    address1,
    address2,
  } = req.body || {};

  if (!userId) {
    return res.status(401).json({
      message: "Please login to update your profile",
    });
  }

  if (
    typeof first_name !== "string" ||
    typeof last_name !== "string" ||
    typeof email !== "string" ||
    !first_name.trim() ||
    !last_name.trim() ||
    !email.trim()
  ) {
    return res.status(400).json({
      message: "First name, last name and email are required",
    });
  }

  const firstName = first_name.trim();
  const lastName = last_name.trim();
  const userEmail = email.trim().toLowerCase();

  const phoneNumber = phone_number == null ? "" : String(phone_number).trim();
  const userAddress1 = address1 == null ? "" : String(address1).trim();
  const userAddress2 = address2 == null ? "" : String(address2).trim();

  if (firstName.length > 100 || lastName.length > 100) {
    return res.status(400).json({
      message: "First name and last name must be within 100 characters",
    });
  }

  if (userEmail.length > 150) {
    return res.status(400).json({
      message: "Email must be within 150 characters",
    });
  }

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(userEmail)) {
    return res.status(400).json({
      message: "Please enter a valid email address",
    });
  }

  if (phoneNumber.length > 20) {
    return res.status(400).json({
      message: "Phone number must be within 20 characters",
    });
  }

  // Cloudinary secure URL; null keeps the existing profile image
  const profileImage = req.file ? req.file.path : null;

  db.query(
    "SELECT id FROM users WHERE email = ? AND id != ?",
    [userEmail, userId],
    (checkError, results) => {
      if (checkError) {
        console.error("Profile email check error:", checkError);
        return res.status(500).json({
          message: "Failed to validate email address",
        });
      }

      if (results.length > 0) {
        return res.status(409).json({
          message: "This email is already registered",
        });
      }

      db.query(
        `UPDATE users
         SET first_name = ?,
             last_name = ?,
             email = ?,
             phone_number = ?,
             address1 = ?,
             address2 = ?,
             profile_image = COALESCE(?, profile_image)
         WHERE id = ?`,
        [
          firstName,
          lastName,
          userEmail,
          phoneNumber || null,
          userAddress1 || null,
          userAddress2 || null,
          profileImage,
          userId,
        ],
        (updateError) => {
          if (updateError) {
            console.error("Profile update error:", updateError);
            return res.status(500).json({
              message: "Failed to update profile",
            });
          }

          db.query(
            `SELECT id, first_name, last_name, email, role,
                    phone_number, address1, address2, profile_image
             FROM users
             WHERE id = ?`,
            [userId],
            (fetchError, updatedUsers) => {
              if (fetchError) {
                console.error("Updated profile fetch error:", fetchError);
                return res.status(500).json({
                  message: "Profile updated, but failed to fetch details",
                });
              }

              if (updatedUsers.length === 0) {
                return res.status(404).json({
                  message: "User not found",
                });
              }

              return res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                user: updatedUsers[0],
              });
            }
          );
        }
      );
    }
  );
};

// LOGOUT USER
const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile,
  logoutUser,
};