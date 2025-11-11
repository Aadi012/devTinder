const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://jhaaditya778_db_user:IC7dsTQruaLUI4qn@backendproject.msuidnk.mongodb.net/devTinder"
  );
};
 
module.exports = connectDB;


