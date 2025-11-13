const validator = require("validator");

const validateSignupData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Please enter the correct name");
  }

  if (!validator.isEmail(emailId)) {
    throw new Error("EmailId is not valid");
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error("Enter a strong password");
  }

  return true;
};

module.exports = { validateSignupData };
