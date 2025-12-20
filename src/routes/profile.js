const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const validator = require("validator");
const User = require("../models/user");

/* ------------------------------------------
 ALLOWED FIELDS
------------------------------------------- */
const ALLOWED_FIELDS = [
  "firstName",
  "lastName",
  "photoUrl",
  "gender",
  "age",
  "about",
  "skills",
  "location",
  "occupation",
  "company",
  "education",
  "interests",
  "social",
];

/* ------------------------------------------
 VIEW PROFILE (clean error)
------------------------------------------- */
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    return res.json({
      success: true,
      data: req.user,
    });

  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Failed to load profile",
      error: err.message,
    });
  }
});

/* ------------------------------------------
 EDIT PROFILE (safe + accurate errors)
------------------------------------------- */
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updates = req.body;

    for (const key of Object.keys(updates)) {
      if (!ALLOWED_FIELDS.includes(key)) continue;

      const value = updates[key];

      /* ----- SOCIAL ----- */
      if (key === "social") {
        const merged = { ...user.social };
        for (const platform of Object.keys(value)) {
          const link = value[platform];
          if (link && !validator.isURL(link)) {
            return res.status(400).json({
              success: false,
              message: `Invalid URL for ${platform}`,
            });
          }
          merged[platform] = link;
        }
        user.social = merged;
        continue;
      }

      /* ----- ARRAY FIELDS ----- */
      if (Array.isArray(user[key])) {
        let arr = value;
        if (typeof value === "string") {
          arr = value.split(",").map((v) => v.trim());
        }
        user[key] = arr;
        continue;
      }

      /* ----- URL CHECK ----- */
      if (key === "photoUrl" && value && !validator.isURL(value)) {
        return res.status(400).json({
          success: false,
          message: "Invalid photo URL",
        });
      }

      user[key] = value;
    }

    await user.save();

    const obj = user.toObject();
    delete obj.password;

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: obj,
    });

  } catch (err) {
    console.error("Edit profile error:", err.message);

    return res.status(400).json({
      success: false,
      message: "Failed to update profile",
      error: err.message, // important for debugging
    });
  }
});

module.exports = profileRouter;
