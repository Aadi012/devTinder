const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
    },

    lastName: {
      type: String,
      default: "",
    },

    emailId: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email Address: " + value);
        }
      },
    },

    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a strong password");
        }
      },
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    age: {
      type: Number,
      min: 18,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    membershipType: {
      type: String,
    },

    photoUrl: {
      type: String,
      default: "",
      validate(value) {
        if (value && !validator.isURL(value)) {
          throw new Error("Invalid Photo URL");
        }
      },
    },

    about: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    /* --------------------------
       PROFILE FIELDS
    --------------------------- */

    location: {
      type: String,
      default: "",
    },

    occupation: {
      type: String,
      default: "",
    },

    company: {
      type: String,
      default: "",
    },

    education: {
      type: String,
      default: "",
    },

    interests: {
      type: [String],
      default: [],
    },

    vibe: {
      type: String,
      default: "", // e.g. "Night Coder", "Chai & Code"
    },

    social: {
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      portfolio: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

/* --------------------------
   DEFAULT PHOTO + ABOUT
--------------------------- */

userSchema.pre("save", function (next) {
  if (!this.photoUrl || this.photoUrl.trim() === "") {
    if (this.gender === "male") {
      this.photoUrl =
        "https://cdn-icons-png.flaticon.com/512/147/147144.png";
    } else if (this.gender === "female") {
      this.photoUrl =
        "https://cdn-icons-png.flaticon.com/512/194/194938.png";
    } else {
      this.photoUrl =
        "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    }
  }

  if (!this.about || this.about.trim() === "") {
    this.about = `Hi, I am ${this.firstName} ${
      this.lastName || ""
    }. Passionate developer exploring new technologies and building amazing projects!`;
  }

  next();
});

/* --------------------------
   JWT TOKEN
--------------------------- */

userSchema.methods.getJWT = async function () {
  return jwt.sign({ _id: this._id }, "DEV@Tinder28928", {
    expiresIn: "7d",
  });
};

/* --------------------------
   PASSWORD VALIDATION
--------------------------- */

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  return bcrypt.compare(passwordInputByUser, this.password);
};

module.exports = mongoose.model("User", userSchema);
