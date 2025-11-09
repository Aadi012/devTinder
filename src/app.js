const express = require("express");

const app = express();

app.get("/user",(req,res)=>{
     res.send({firstName:"Aditya", lastName:"Jha"});
});

app.post("/user",(req,res)=>{
     res.send("data saved sucessfully in database...!")
})
 
app.delete("/user",(req,res)=>{
     res.send("user is deleted now.!")
})
app.use("/test", (req, res) => {
  res.send("server is listening from test");
});

app.listen(8888, () => {
  console.log("server is working on 8888...");
});
