const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const { run } = require("./sendEmail");
const ConnectionRequestModel = require("../models/connectionRequest");

console.log("✅ Homio cron file loaded");

/*
  TEST MODE (every minute)
  AFTER SUCCESS:
  Change to 👉 "30 2 * * *"  for 8:00 AM IST
*/
cron.schedule("30 2 * * *", async () => {
  console.log("\n🕒 Homio cron is running...");

  try {
    const now = new Date();

    // Convert UTC → IST (+5:30)
    const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);

    const yesterday = subDays(istNow, 1);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    console.log("IST Start:", yesterdayStart);
    console.log("IST End  :", yesterdayEnd);

    const pendingRequests = await ConnectionRequestModel.find({
      status: "interested",
      createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
    }).populate("fromUserId toUserId");

    console.log("📌 Pending requests:", pendingRequests.length);

    if (!pendingRequests.length) {
      console.log("ℹ️ No requests found for yesterday");
      return;
    }

    // 🔒 TEMP FIX FOR SES SANDBOX (only verified email)
    const listOfEmails = ["jhaaditya778@gmail.com"];

    console.log("📧 Sending to:", listOfEmails);

    for (const email of listOfEmails) {
      const subject = "You have pending connection requests on Homio";
      const message = `
Hi 👋

You received one or more new connection requests yesterday on Homio.

Login now and review them:
https://www.homio.co.in
      `;

      try {
        await run(subject, message, email);
      } catch (err) {
        console.log(`❌ Failed to send to ${email}`);
      }
    }
  } catch (err) {
    console.error("❌ Cron main error:", err.message);
  }
});
