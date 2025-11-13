const mongoose = require("mongoose");
const validator = require("validator")

const userSchema = new mongoose.Schema({
  firtstName: {
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
    validate(value){
      if(!validator.isEmail(value)){
        throw new Error("Inavlid Email Address" + value);
      }
    },
  },
  password: {
    type: String,
    required: true,
    validate(value){
      if(!validator.isStrongPassword(value)){
        throw new Error("Enter a strong password" + value);
      }
    },
  },
  gender: {
    type: String,
    validate(value) {
      if (!["male", "female", "others"].includes(value)) {
        throw new Error("gender data is not valid..!");
      }
    },
  },
  age: {
    type: Number,
    min: 18,
  },
  photoUrl: {
    type: String,
    default:
      "https://www.shutterstock.com/image-vector/simple-gray-avatar-icons-representing-260nw-2473353263.jpg",
      validate(value){
      if(!validator.isURL(value)){
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
},{
  timestamps:true,
});

module.exports = mongoose.model("User", userSchema);
