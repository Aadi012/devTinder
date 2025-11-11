const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");

app.post("/signup", async (req,res)=>{


const user = new User({
     firtstName: "Virat",
     lastName: "Kohli",
     email : "viratkohli@gmail.com",
     password :"Virat@123",
});
   await user.save();
   res.send("User Added Successfully...!!");
});

connectDB()
  .then(() => {
    console.log("Database connection established... ");
    app.listen(8888, () => {
      console.log("server is working on 8888...");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected.!!");
  });
