const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://jhaaditya778_db_user:IC7dsTQruaLUI4qn@backendproject.msuidnk.mongodb.net/devTinder"
    );
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database cannot be connected!!", error.message);
    // process.exit(1);
  }
};

module.exports = connectDB;
