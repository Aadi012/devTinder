const express = require("express");
const authRouter = express.Router();
const { validateSignupData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const validator = require("validator");

/* ----------------------------------------
      NORMALIZE EMAIL
---------------------------------------- */
const normalizeEmail = (email) => email.toLowerCase().trim();

/* ----------------------------------------
      SAFE USER OBJECT (REMOVE PASSWORD)
---------------------------------------- */
const toSafeUser = (user) => {
  const obj = user.toObject();
  delete obj.password;
  return obj;
};

/* ----------------------------------------
      SECURE COOKIE SETTINGS
---------------------------------------- */
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  expires: new Date(Date.now() + 8 * 3600000), // 8 hr
};

/* ============================================================
                      SIGNUP (FULL PROFILE)
============================================================ */
authRouter.post("/signup", async (req, res) => {
  try {
    validateSignupData(req);

    let {
      firstName,
      lastName,
      emailId,
      password,
      age,
      gender,
      about,
      photoUrl,
      skills = [],
      interests = [],
      location = "",
      occupation = "",
      education = "",
      company = "",
      social = {},
    } = req.body;

    emailId = normalizeEmail(emailId);

    // Check if user already exists
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered. Please login instead.",
      });
    }

    // Strong password validation
    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be strong (min 8 chars incl uppercase, number & symbol).",
      });
    }

    // Convert array-like strings into arrays
    if (typeof skills === "string") {
      skills = skills.split(",").map((s) => s.trim());
    }
    if (typeof interests === "string") {
      interests = interests.split(",").map((s) => s.trim());
    }

    // Validate social URLs
    const validSocial = {};
    const allowedSocial = ["github", "linkedin", "portfolio"];

    for (const key of allowedSocial) {
      if (social[key]) {
        if (!validator.isURL(social[key])) {
          return res.status(400).json({
            success: false,
            message: `Invalid URL for ${key}`,
          });
        }
        validSocial[key] = social[key];
      } else {
        validSocial[key] = "";
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      age,
      gender,
      about,
      photoUrl,
      skills,
      interests,
      location,
      occupation,
      education,
      company,
      social: validSocial,
    });

    const savedUser = await user.save();
    const safeUser = toSafeUser(savedUser);

    // Assign JWT
    const token = await savedUser.getJWT();

    // Set cookie
    res.cookie("token", token, cookieOptions);

    return res.json({
      success: true,
      message: "Account created successfully!",
      data: safeUser,
    });

  } catch (err) {
    console.error("SIGNUP ERROR:", err.message);

    return res.status(400).json({
      success: false,
      message: err.message || "Signup failed. Please try again.",
    });
  }
});

/* ============================================================
                      LOGIN
============================================================ */
authRouter.post("/login", async (req, res) => {
  try {
    let { emailId, password } = req.body;

    emailId = normalizeEmail(emailId);

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password.",
      });
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password.",
      });
    }

    const token = await user.getJWT();

    res.cookie("token", token, cookieOptions);

    return res.json({
      success: true,
      message: "Logged in successfully!",
      data: toSafeUser(user),
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err.message);

    return res.status(400).json({
      success: false,
      message: err.message || "Login failed. Please try again.",
    });
  }
});

/* ============================================================
                      LOGOUT
============================================================ */
authRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now()),
    });

    return res.json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (err) {
    console.error("LOGOUT ERROR:", err.message);

    return res.status(400).json({
      success: false,
      message: "Logout failed. Try again!",
    });
  }
});

module.exports = authRouter;
