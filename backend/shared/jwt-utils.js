const { verify, sign } = require("jsonwebtoken");

const secret = process.env.JWT_SECRET || "your-secret-key";
const expiresIn = "24h";

const decodeToken = (token) => {
  if (!token) return;
  token = token.split(" ")[1];
  if (!token) return;
  return verify(token, secret);
};

const encodeToken = (payload) => {
  return sign(payload, secret, { expiresIn });
};

module.exports = { decodeToken, encodeToken };