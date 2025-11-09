const express = require("express");

const app = express();

app.use("/",(req,res,next) =>{
     res.send("Namaste Aditya,how are you?");
});

app.use("/test",(req,res) =>{
     res.send("server is listening from test");
});

app.use("/hello",(req,res) =>{
     res.send("server is saying hello");
});

app.listen(8888,()=>{
    console.log("server is working on 8888...");
});
