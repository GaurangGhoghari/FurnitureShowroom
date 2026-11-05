const db = require("../db/db");

// GET ALL USERS - SEARCH + PAGINATION + SORTING
const getAllUsers = (req, res) => {
  try {
    // 1. Get pagination values
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);

    const allowedLimits = [3, 5, 10, 20];
    const requestedLimit = parseInt(req.query.limit, 10) || 3;

    const limit = allowedLimits.includes(requestedLimit)
      ? requestedLimit
      : 3;

    const offset = (page - 1) * limit;
    const search = (req.query.search || "").trim();

    const status = String(req.query.status || "all").toLowerCase();

if (!["all", "active", "inactive"].includes(status)) {
  return res.status(400).json({
    success: false,
    message: "Invalid user status filter",
  });
}

    // 2. Allowed sorting columns and directions
    const sortOptions = {
      name_asc: "first_name ASC, last_name ASC",
      name_desc: "first_name DESC, last_name DESC",
      email_asc: "email ASC",
      email_desc: "email DESC",
      role_asc: "role ASC",
      role_desc: "role DESC",
      registered_asc: "created_at ASC",
      registered_desc: "created_at DESC",
    };

    const sortBy = String(req.query.sortBy || "name_asc");
    const orderBy = sortOptions[sortBy] || sortOptions.name_asc;
 
    // 3. Build search + status filter conditions
    const conditions = [];
    const params = [];

    // Status filter
    if (status === "active") {
      conditions.push("status = ?");
      params.push("active");
    } else if (status === "inactive") {
      conditions.push("status = ?");
      params.push("inactive");
    }

    // Search by name or email; supports multiple words
    if (search) {
      const searchWords = search.split(/\s+/).filter(Boolean);

      searchWords.forEach((word) => {
        conditions.push(`
          (
            first_name LIKE ?
            OR last_name LIKE ?
            OR email LIKE ?
          )
        `);

        const searchValue = `%${word}%`;

        params.push(searchValue, searchValue, searchValue);
      });
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";


    // 4. Count matching users
    const countSql = `
      SELECT COUNT(*) AS total
      FROM users
      ${whereClause}
    `;

    db.query(countSql, params, (countError, countResult) => {
      if (countError) {
        console.error("Count Users Error:", countError);

        return res.status(500).json({
          success: false,
          message: "Failed to count users",
        });
      }

      const totalUsers = Number(countResult[0].total);
      const totalPages = Math.ceil(totalUsers / limit);

      // 5. Fetch only the requested page
      // Never return the password column.
      const usersSql = `
        SELECT
          id,
          first_name,
          last_name,
          email,
          role,
          status,
          created_at
        FROM users
        ${whereClause}
        ORDER BY ${orderBy}, id ASC
        LIMIT ? OFFSET ?
      `;

      db.query(
        usersSql,
        [...params, limit, offset],
        (usersError, users) => {
          if (usersError) {
            console.error("Get Users Error:", usersError);

            return res.status(500).json({
              success: false,
              message: "Failed to fetch users",
            });
          }

          return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: users,
            pagination: {
              currentPage: page,
              limit,
              totalUsers,
              totalPages,
            },
          });
        }
      );
    });
  } catch (error) {
    console.error("Get All Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

const updateUserStatus = (req, res) => {
  const userId = Number(req.params.id);
  const { status } = req.body;

  // Validate user ID
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  // Only these two status values are allowed
  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be active or inactive",
    });
  }

  // Check whether user exists
  const findUserSql = `
    SELECT id, role
    FROM users
    WHERE id = ?
  `;

  db.query(findUserSql, [userId], (error, results) => {
    if (error) {
      console.error("Find User Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to find user",
      });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Do not change the status of admin accounts here
    if (results[0].role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin account status cannot be changed here",
      });
    }

    // Update status
    const updateSql = `
      UPDATE users
      SET status = ?
      WHERE id = ?
    `;

    db.query(updateSql, [status, userId], (updateError) => {
      if (updateError) {
        console.error("Update User Status Error:", updateError);

        return res.status(500).json({
          success: false,
          message: "Failed to update user status",
        });
      }

      return res.status(200).json({
        success: true,
        message: `User status updated to ${status}`,
        data: {
          id: userId,
          status,
        },
      });
    });
  });
};

// GET SINGLE USER PROFILE
const getUserProfile = (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  const sql = `
    SELECT
      id,
      first_name,
      last_name,
      email,
      role,
      status,
      phone_number,
      address1,
      address2,
      profile_image,
      created_at
    FROM users
    WHERE id = ?
  `;

  db.query(sql, [userId], (error, results) => {
    if (error) {
      console.error("Get User Profile Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch user profile",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: results[0],
    });
  });
};

module.exports = { getAllUsers,updateUserStatus, getUserProfile,};