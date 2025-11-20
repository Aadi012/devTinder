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
          throw new Error("Inavlid Email Address" + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a strong password" + value);
        }
      },
    },
    gender: {
      type: String,
      enum : {
        values:["male","female","other"],
        message: '{VALUES} is not a valid gende type',
      },
      // validate(value) {
      //   if (!["male", "female", "others"].includes(value)) {
      //     throw new Error("gender data is not valid..!");
      //   }
      // },
    },
    age: {
      type: Number,
      min: 18,
    },
    photoUrl: {
      type: String,
      default:
        "https://www.shutterstock.com/image-vector/simple-gray-avatar-icons-representing-260nw-2473353263.jpg",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Inavlid Photo URL :" + value);
        }
      },
    },
    about: {
      type: String,
      default: "This Is default about of this user",
    },
    skills: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

//User.find({firstName:"Aditya", lastName:"Jha"});

// userSchema.index({firstName:1, lastName:1});

userSchema.methods.getJWT = async function () {
  const user = this;

  const token = await jwt.sign({ _id: user._id }, "DEV@Tinder28928", {
    expiresIn: "7d",
  });
  return token;
};



userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash
  );
  return isPasswordValid;
};

module.exports = mongoose.model("User", userSchema);