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
          throw new Error("Enter a strong password: " + value);
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
    photoUrl: {
      type: String,
      default: "", // initially empty, will be set in pre-save
      validate(value) {
        if (value && !validator.isURL(value)) {
          throw new Error("Invalid Photo URL: " + value);
        }
      },
    },
    about: {
      type: String,
      default: "", // will be set in pre-save
    },
    skills: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Set default photoUrl and about based on gender if not provided
userSchema.pre("save", function (next) {
  if (!this.photoUrl || this.photoUrl.trim() === "") {
    // Set default photo based on gender
    if (this.gender === "male") {
      this.photoUrl =
        "https://cdn-icons-png.flaticon.com/512/147/147144.png"; // default male
    } else if (this.gender === "female") {
      this.photoUrl =
        "https://cdn-icons-png.flaticon.com/512/194/194938.png"; // default female
    } else {
      this.photoUrl =
        "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // default other/unknown
    }
  }

  if (!this.about || this.about.trim() === "") {
    this.about = `Hi, I am ${this.firstName} ${this.lastName || ""}. Passionate developer exploring new technologies and building amazing projects!`;
  }

  next();
});

// JWT generation
userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, "DEV@Tinder28928", {
    expiresIn: "7d",
  });
  return token;
};

// Validate password
userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordValid = await bcrypt.compare(passwordInputByUser, passwordHash);
  return isPasswordValid;
};

module.exports = mongoose.model("User", userSchema);
