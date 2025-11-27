const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("./sesClient");


const createSendEmailCommand = (
  toAddress,
  subject,
  htmlBody,
  textBody
) => {
  return new SendEmailCommand({
    Source: "aditya@homio.co.in", 
    Destination: {
      ToAddresses: [toAddress],
    },

    Message: {
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },

      Body: {
        Html: {
          Charset: "UTF-8",
          Data: htmlBody,
        },
        Text: {
          Charset: "UTF-8",
          Data: textBody,
        },
      },
    },
  });
};


const run = async () => {
  const sendEmailCommand = createSendEmailCommand(
    "jhaaditya778@gmail.com",
    "Welcome to Homio 🚀",
    `
      <h1>Welcome to Homio</h1>
      <p>Your account is ready.</p>
      <p>Let’s build something amazing.</p>
    `,
    "Welcome to Homio. Your account is ready."
  );

  try {
    const response = await sesClient.send(sendEmailCommand);
    console.log("✅ Email sent successfully:", response.MessageId);
    return response;
  } catch (err) {
    console.log("\n❌ AWS FULL ERROR:");
    console.log(JSON.stringify(err, null, 2));
    throw err;
  }
};

module.exports = { run };
