const jwt = require("express-jwt");
const secret = process.env.ACCESS_TOKEN_SECRET;

const authenticate = jwt({
	secret: secret,
	getToken: function fromHeaderOrQuerystring (req) {
		if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
			return req.headers.authorization.split(' ')[1];
		} else if (req.query && req.query.token) {
			return req.query.token;
		}
		return null;
	}
});

module.exports = authenticate;