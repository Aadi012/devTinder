const express = require("express");
const authRouter = express.Router();
const { validateSignupData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

// ------------------ SIGNUP ------------------
authRouter.post("/signup", async (req, res) => {
  try {
    // Validation of data
    validateSignupData(req);

    const { firstName, lastName, emailId, password,skills,age,gender,about,photoUrl } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      skills,
      age,
      gender,
      photoUrl,
      about,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    // Set cookie with proper options
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 8 * 3600000),
      sameSite: "lax", // allows cross-site cookies
      secure: false,   // true only if HTTPS
    });

    res.json({ message: "User Added Successfully!", data: savedUser });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// ------------------ LOGIN ------------------
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId });
    if (!user) throw new Error("Invalid credentials");

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) throw new Error("Invalid credentials");

    const token = await user.getJWT();

    // Set cookie with proper options
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 8 * 3600000),
      sameSite: "lax",
      secure: false,
    });

    res.json({ message: "Login successful!", data: user });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// ------------------ LOGOUT ------------------
authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
    sameSite: "lax",
    secure: false,
  });
  res.send("Logout Successfully!");
});

module.exports = authRouter;
