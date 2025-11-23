
const express = require("express");
const connectDB = require("./config/database");
const app = express();

const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(cors({
  origin: "http://16.170.218.197",
  credentials:true,
}));
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

app.use("/api", authRouter);
app.use("/api", profileRouter);
app.use("/api", requestRouter);
app.use("/api", userRouter);
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
