const express = require("express");
const authRouter = express.Router();
const { validateSignupData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

// ------------------ SIGNUP ------------------
authRouter.post("/signup", async (req, res) => {
  try {
    // Validate input fields
    validateSignupData(req);

    const { firstName, lastName, emailId, password, skills, age, gender, about, photoUrl } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered. Please login instead.",
      });
    }

    // Strong password recommendation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      skills,
      age,
      gender,
      about,
      photoUrl,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    // Set secure cookie
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 8 * 3600000),
      sameSite: "lax",
      secure: false, // Change to true when using HTTPS
    });

    return res.json({
      success: true,
      message: "Account created successfully!",
      data: savedUser,
    });

  } catch (err) {
    console.error("SIGNUP ERROR:", err.message);

    return res.status(400).json({
      success: false,
      message: err.message || "Signup failed. Please try again.",
    });
  }
});

// ------------------ LOGIN ------------------
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    // Check user existence
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password.",
      });
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password.",
      });
    }

    const token = await user.getJWT();

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 8 * 3600000),
      sameSite: "lax",
      secure: false,
    });

    return res.json({
      success: true,
      message: "Login successful!",
      data: user,
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err.message);

    return res.status(400).json({
      success: false,
      message: err.message || "Login failed. Please try again.",
    });
  }
});

// ------------------ LOGOUT ------------------
authRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, {
      httpOnly: true,
      expires: new Date(Date.now()),
      sameSite: "lax",
      secure: false,
    });

    return res.json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Logout failed. Try again!",
    });
  }
});

module.exports = authRouter;
