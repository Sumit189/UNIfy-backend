const auth = require("../middlewares/jwt");
const apiResponse = require("../helpers/apiResponse");

exports.userSession = [
    auth,
    function (req, res) {
		return apiResponse.successResponseWithData(res, "Operation success", {});
	}
]