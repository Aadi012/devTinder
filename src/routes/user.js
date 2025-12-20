const express = require("express");
const mongoose = require("mongoose");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const userRouter = express.Router();

/* ---------------------------------------------
   SAFE FIELDS TO SEND TO FRONTEND
--------------------------------------------- */
const userSafeData =
  "firstName lastName photoUrl skills about age gender location occupation company education interests social";

/* ---------------------------------------------
   HELPER — validate ObjectId
--------------------------------------------- */
const isValid = (id) => mongoose.Types.ObjectId.isValid(id);

/* ============================================================
   GET RECEIVED CONNECTION REQUESTS
============================================================ */
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const requests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", userSafeData);

    return res.json({
      success: true,
      message: "Received requests fetched successfully",
      data: requests,
    });
  } catch (err) {
    console.error("FETCH REQUESTS ERROR:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch received requests.",
    });
  }
});

/* ============================================================
   GET ACCEPTED CONNECTIONS
============================================================ */
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connections = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", userSafeData)
      .populate("toUserId", userSafeData);

    // return the *other* user in each pair
    const finalList = connections.map((row) => {
      return row.fromUserId._id.toString() === loggedInUser._id.toString()
        ? row.toUserId
        : row.fromUserId;
    });

    return res.json({
      success: true,
      message: "Connections fetched successfully",
      data: finalList,
    });
  } catch (err) {
    console.error("FETCH CONNECTIONS ERROR:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user connections.",
    });
  }
});

/* ============================================================
   FEED — USERS YOU HAVE NOT CONNECTED WITH
============================================================ */
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    /* ---------------- Pagination ---------------- */
    const page = Math.max(1, parseInt(req.query.page) || 1);
    let limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    /* ---------------- Get all IDs already connected/requested ---------------- */
    const existing = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideIds = new Set();
    existing.forEach((x) => {
      hideIds.add(x.fromUserId.toString());
      hideIds.add(x.toUserId.toString());
    });

    /* ---------------- Query feed users ---------------- */
    const filter = {
      _id: {
        $nin: Array.from(hideIds),
        $ne: loggedInUser._id,
      },
    };

    const totalCount = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select(userSafeData)
      .skip(skip)
      .limit(limit);

    return res.json({
      success: true,
      message: "Feed fetched successfully",
      page,
      limit,
      total: totalCount,
      data: users,
    });
  } catch (err) {
    console.error("FEED ERROR:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch feed.",
    });
  }
});


/* ============================================================
   GET PUBLIC PROFILE OF ANY USER BY ID
============================================================ */
 /* ============================================================
   GET PUBLIC PROFILE (SAFE + NO ROUTE CONFLICT)
============================================================ */
userRouter.get("/user/profile/:id", userAuth, async (req, res) => {
  console.log("🔥 PUBLIC PROFILE ROUTE HIT:", req.params.id);
  try {
    const { id } = req.params;

    if (!isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_USER_ID",
        message: "The provided user ID format is not valid.",
      });
    }

    const user = await User.findById(id).select(userSafeData);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "USER_NOT_FOUND",
        message: "No user found with the provided ID.",
      });
    }

    return res.json({
      success: true,
      message: "User profile fetched successfully.",
      data: user,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "Something went wrong while fetching user profile.",
      details: err.message,
    });
  }
});



module.exports = userRouter;
