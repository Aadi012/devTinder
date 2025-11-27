const path = require("path");

/*
  FORCE LOAD ROOT .env FILE
  (Same folder where your package.json exists)
*/
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

const {
  SESClient,
  ListIdentitiesCommand,
  GetAccountSendingEnabledCommand,
} = require("@aws-sdk/client-ses");

/* ---------------------------------------
   1. DEBUG PATHS
----------------------------------------*/
console.log("\n🧪 CURRENT WORKING DIR:", process.cwd());
console.log("🧪 LOOKING FOR .env AT:", path.join(process.cwd(), ".env"));

/* ---------------------------------------
   2. ENV CHECK
----------------------------------------*/
console.log("\n🔍 ENV CHECK");
console.log(
  "AWS_ACCESS_KEY_ID:",
  process.env.AWS_ACCESS_KEY ? "LOADED ✅" : "MISSING ❌"
);
console.log(
  "AWS_SECRET_ACCESS_KEY:",
  process.env.AWS_SECRET_KEY ? "LOADED ✅" : "MISSING ❌"
);
console.log("AWS_REGION:", process.env.AWS_REGION || "MISSING ❌");

if (
  !process.env.AWS_ACCESS_KEY ||
  !process.env.AWS_SECRET_KEY ||
  !process.env.AWS_REGION
) {
  console.log("\n❌ YOUR .env FILE IS NOT CONFIGURED CORRECTLY\n");
  console.log("✔ It must be in the SAME folder as package.json");
  console.log("✔ It must be named exactly: .env");
  console.log("✔ Format must be:");
  console.log("-----------------------------------");
  console.log("AWS_ACCESS_KEY_ID=xxxxx");
  console.log("AWS_SECRET_ACCESS_KEY=xxxxx");
  console.log("AWS_REGION=ap-south-1");
  console.log("-----------------------------------\n");

  process.exit(1);
}

/* ---------------------------------------
   3. CREATE SES CLIENT
----------------------------------------*/
const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,

    // only if you ever use ASIA type key
    ...(process.env.AWS_SESSION_TOKEN && {
      sessionToken: process.env.AWS_SESSION_TOKEN,
    }),
  },
});

/* ---------------------------------------
   4. TEST AWS + SES CONNECTION
----------------------------------------*/
async function testSESConnection() {
  try {
    console.log("\n⏳ Testing AWS credentials...");

    const sendingStatus = await sesClient.send(
      new GetAccountSendingEnabledCommand({})
    );

    console.log("\n✅ CONNECTED TO AWS SES");
    console.log("📤 Sending enabled:", sendingStatus.Enabled);

    const identities = await sesClient.send(new ListIdentitiesCommand({}));

    console.log("\n✅ VERIFIED IDENTITIES:");
    if (!identities.Identities.length) {
      console.log("⚠️  No verified email/domain found in SES");
    } else {
      identities.Identities.forEach((id) => {
        console.log("   →", id);
      });
    }

    console.log("\n🎉 AWS KEYS + REGION ARE WORKING PERFECTLY\n");
  } catch (err) {
    console.log("\n❌ AWS CONNECTION FAILED\n");
    console.log("ERROR NAME:", err.name);
    console.log("ERROR MESSAGE:", err.message);

    if (err.name === "InvalidClientTokenId") {
      console.log("\n👉 ACCESS KEY / SECRET KEY is WRONG");
    }

    if (err.name === "SignatureDoesNotMatch") {
      console.log("\n👉 SECRET KEY does not match ACCESS KEY");
    }

    if (err.name === "UnrecognizedClientException") {
      console.log("\n👉 REGION DOES NOT MATCH SES REGION");
    }

    if (err.name === "AccessDeniedException") {
      console.log("\n👉 IAM USER HAS NO AMAZON SES PERMISSION");
    }

    if (err.name === "ExpiredTokenException") {
      console.log("\n👉 YOU USED TEMP KEY (ASIA) WITHOUT SESSION TOKEN");
    }

    console.log("\n✅ REQUIRED CHECKS:");
    console.log("1. Key must be ACTIVE in IAM");
    console.log("2. Region must be ap-south-1");
    console.log("3. IAM must have AmazonSESFullAccess\n");

    process.exit(1);
  }
}

/* ---------------------------------------
   5. AUTO RUN TEST
----------------------------------------*/
testSESConnection();

module.exports = { sesClient };
