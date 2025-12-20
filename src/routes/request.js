// routes/request.js
const express = require("express");
const mongoose = require("mongoose");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const { run } = require("../utils/sendEmail");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id.toString();
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested", "superliked"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid request status." });
      }

      if (!isValidObjectId(toUserId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID." });
      }

      if (fromUserId === toUserId) {
        return res.status(400).json({ success: false, message: "Cannot send request to yourself." });
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ success: false, message: "Target user not found." });
      }

      const existing = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "A connection or pending request already exists between you two.",
        });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      // send email asynchronously
      // if (toUser.emailId) {
      //   const subject = `New connection request from ${req.user.firstName} on Homio`;
      //   const message = `Hi ${toUser.firstName},\n\nYou have received a new connection request from ${req.user.firstName}.\n\nLogin: https://www.homio.co.in`;
      //   run(subject, message, toUser.emailId).catch((err) => console.error("EMAIL ERROR:", err));
      // }

      const statusMap = {
        interested: `${req.user.firstName} is interested in connecting with ${toUser.firstName}.`,
        ignored: `${req.user.firstName} ignored ${toUser.firstName}.`,
        superliked: `${req.user.firstName} superliked ${toUser.firstName}!`,
      };

      return res.json({ success: true, message: statusMap[status], data });
    } catch (err) {
      console.error("SEND REQUEST ERROR:", err);
      return res.status(500).json({ success: false, message: "Failed to send request." });
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const { status, requestId } = req.params;
      const loggedInUserId = req.user._id;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid review status." });
      }

      if (!isValidObjectId(requestId)) {
        return res.status(400).json({ success: false, message: "Invalid request ID." });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUserId,
        status: "interested",
      });

      if (!connectionRequest) {
        return res.status(404).json({ success: false, message: "Request not found or already processed." });
      }

      connectionRequest.status = status;
      const data = await connectionRequest.save();

      return res.json({ success: true, message: `Connection request ${status}.`, data });
    } catch (err) {
      console.error("REVIEW REQUEST ERROR:", err);
      return res.status(500).json({ success: false, message: "Failed to review request." });
    }
  }
);

module.exports = requestRouter;
