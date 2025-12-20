const validator = require("validator");

/* ======================================================
   VALIDATE SIGNUP INPUT
====================================================== */
const validateSignupData = (req) => {
  const {
    firstName,
    lastName,
    emailId,
    password,
    age,
    gender,
    skills,
    about,
    photoUrl,
    interests,
    location,
    occupation,
    company,
    education,
    social,
  } = req.body;

  /* -------- NAME ---------- */
  if (!firstName || firstName.length < 2) {
    throw new Error("First name must be at least 2 characters long.");
  }
  if (!lastName || lastName.length < 1) {
    throw new Error("Last name must be provided.");
  }

  /* -------- EMAIL ---------- */
  if (!validator.isEmail(emailId)) {
    throw new Error("Email address is invalid.");
  }

  /* -------- PASSWORD ---------- */
  if (!validator.isStrongPassword(password)) {
    throw new Error(
      "Password must be strong (min 8 chars, uppercase, lowercase, number, symbol)."
    );
  }

  /* -------- AGE (optional) ---------- */
  if (age && (age < 13 || age > 120)) {
    throw new Error("Age must be between 13 and 120.");
  }

  /* -------- GENDER (optional) ---------- */
  if (gender && !["male", "female", "other"].includes(gender)) {
    throw new Error("Gender must be male, female, or other.");
  }

  /* -------- PHOTO ---------- */
  if (photoUrl && !validator.isURL(photoUrl)) {
    throw new Error("Profile photo URL is invalid.");
  }

  /* -------- SKILLS ---------- */
  if (skills && !Array.isArray(skills)) {
    throw new Error("Skills must be an array.");
  }

  /* -------- INTERESTS ---------- */
  if (interests && !Array.isArray(interests)) {
    throw new Error("Interests must be an array.");
  }

  /* -------- SOCIAL LINKS ---------- */
  if (social) {
    if (social.github && !validator.isURL(social.github)) {
      throw new Error("GitHub URL is invalid.");
    }
    if (social.linkedin && !validator.isURL(social.linkedin)) {
      throw new Error("LinkedIn URL is invalid.");
    }
    if (social.portfolio && !validator.isURL(social.portfolio)) {
      throw new Error("Portfolio URL is invalid.");
    }
  }

  return true;
};

/* ======================================================
   VALIDATE EDIT PROFILE
====================================================== */
const validateEditProfileData = (req) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "about",
    "skills",
    "photoUrl",
    "interests",
    "location",
    "occupation",
    "company",
    "education",
    "social",
  ];

  const invalidFields = Object.keys(req.body).filter(
    (f) => !allowedFields.includes(f)
  );

  if (invalidFields.length > 0) {
    throw new Error(`You cannot edit: ${invalidFields.join(", ")}`);
  }

  // extra validation inside PATCH
  if (req.body.photoUrl && !validator.isURL(req.body.photoUrl)) {
    throw new Error("PhotoURL must be a valid link.");
  }

  if (req.body.social) {
    if (
      req.body.social.github &&
      !validator.isURL(req.body.social.github)
    ) {
      throw new Error("GitHub link is invalid.");
    }
    if (
      req.body.social.linkedin &&
      !validator.isURL(req.body.social.linkedin)
    ) {
      throw new Error("LinkedIn link is invalid.");
    }
    if (
      req.body.social.portfolio &&
      !validator.isURL(req.body.social.portfolio)
    ) {
      throw new Error("Portfolio link is invalid.");
    }
  }

  return true;
};

module.exports = {
  validateSignupData,
  validateEditProfileData,
};
