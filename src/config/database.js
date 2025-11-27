const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION_SECRET);
    console.log(process.env.DB_CONNECTION_SECRET);
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database cannot be connected!!", error.message);
    // process.exit(1);
  }
};

module.exports = connectDB;
