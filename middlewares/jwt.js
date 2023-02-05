const jwt = require("express-jwt");
const secret = process.env.ACCESS_TOKEN_SECRET;

const authenticate = jwt({
	secret: secret
});

module.exports = authenticate;