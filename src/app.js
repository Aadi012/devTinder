const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");

app.use(express.json());

app.post("/signup", async (req, res) => {
  const user = new User(req.body);


  try {
    await user.save();
    res.send("User Added Successfully...!!");
  } catch (err) {
    res.status(400).send("Error saving the user:" + err.message);
  }
});

// get a user by email
app.get("/user", async (req, res) =>{
     const userEmail = req.body.emailId;
     try {
        const users = await User.find({emailId : userEmail});
        if(users.length===0){
          res.status(404).send("user not found");
        }else{
            res.send(users);
        }
        
     }
    catch (err) {
      res.status(400).send("Something went wrong");
    }
});

// Feed API - Get /feed - get all the user from database

app.get("/feed", async (req, res) =>{
    try{
        const users = await User.find({});
        res.send(users);
    }catch (err) {
      res.status(400).send("Something went wrong");
    }
});
// delete a user from database
app.delete("/user", async (req, res) =>{
    const userId = req.body.userId;
   try{
     const user = await User.findByIdAndDelete({_id:userId});
     res.send("user deleted successfully..!");
   }catch (err) {
      res.status(400).send("Something went wrong");
    }
});

app.patch("/user", async (req, res) =>{
    const userId = req.body.userId;
    const data = req.body;
    try {
       const user = await User.findByIdAndUpdate({_id:userId}, data,{
         returnDocument:"after",
         runValidators:true,
       });
       res.send("user updated successfully");
    }catch (err) {
      res.status(400).send("Something went wrong");
    }
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
