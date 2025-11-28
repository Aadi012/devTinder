const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("./sesClient");

const createSendEmailCommand = (toAddress, subject, htmlBody, textBody) => {
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

const run = async (subject, message, toEmail) => {
  const htmlTemplate = `
    <h2>Hello from Homio</h2>
    <p>${message}</p>

    <br/>
    <a href="https://www.homio.co.in">Open Homio</a>
    <br/><br/>

    <p>Team Homio</p>
  `;

  const sendEmailCommand = createSendEmailCommand(
    toEmail,
    subject,
    htmlTemplate,
    message
  );

  try {
    const response = await sesClient.send(sendEmailCommand);
    console.log(`✅ Email sent to ${toEmail}`);
    return response;
  } catch (err) {
    console.log("\n❌ AWS FULL ERROR:");
    console.log(JSON.stringify(err, null, 2));
    throw err;
  }
};

module.exports = { run };
