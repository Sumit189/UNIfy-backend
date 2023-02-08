const UserModel = require("../models/UserModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const auth = require("../middlewares/jwt");

//helper file to prepare responses.
const jwt = require("jsonwebtoken");
const apiResponse = require("../helpers/apiResponse");

/**
/**

User registration.
@param {string} userName
@param {string} category
@param {string} uuid
@param {string} email
@returns {Object}
*/
exports.register = [
    // Validate fields
    body("userName").isLength({ min: 1 }).trim().withMessage("User name must be specified.").isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
    body("category").isLength({ min: 1 }).trim().withMessage("Category must be specified.").isAlphanumeric().withMessage("Last name has non-alphanumeric characters."),
    body("uuid").isLength({ min: 1 }).trim().withMessage("UUID must be specified.").isAlphanumeric().withMessage("UUID has non-alphanumeric characters."),
    body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.").isEmail().withMessage("Email must be a valid email address.").custom((value) => {
        return UserModel.findOne({email : value}).then((user) => {
            if (user) {
                return Promise.reject("E-mail already in use");
            }
        });
    }),

    // Sanitize fields.
    sanitizeBody("userName").escape(),
    sanitizeBody("category").escape(),
    sanitizeBody("uuid").escape(),
    sanitizeBody("email").escape(),

    // Process request after validation and sanitization.
    (req, res) => {
		console.log(req.body);
        try {
            // Extract the validation errors from a request.
        const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // Display sanitized values/errors messages.
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            } else {
                // Create User object with escaped and trimmed data
                var user = new UserModel({
					userName: req.body.userName,
					category: req.body.category,
					uuid: req.body.uuid,
					email: req.body.email,
                });
				
				user.save((error) => {
					if (error) {
					  return apiResponse.ErrorResponse(res, error);
					} else {
					  return apiResponse.successResponseWithData(res, "User registered successfully.", {uuid: user.uuid});
					}
				});
            }
        }
        catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
    }
]

/**
 * User Login with UUID.
 *
 * @param {string} uuid
 *
 * @returns {Object}
 */
exports.login = [
	body("uuid").isLength({ min: 1 }).trim().withMessage("UUID must be specified."),
	sanitizeBody("uuid").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				UserModel.findOne({uuid : req.body.uuid}, {_id: 1, userName: 1, category: 1, type: 1, email: 1}).then(user => {
					if (user) {
                        let userData = {
                            id: user._id,
                            userName: user.userName,
                            email: user.email,
                        };
                        const accessToken = generateAccesToken(userData)
						return apiResponse.successResponseWithData(res, "User Found.", {accessToken: accessToken});
					} else{
						return apiResponse.unauthorizedResponse(res, "User Not Found");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
];


/**
 * User Check with UUID.
 *
 * @returns {boolean}
 */
exports.checkSignup = [
    auth,
	(req, res) => {
		try {
			UserModel.findOne({uuid : req.body.uuid}).then(user => {
                if (user) {
                    return apiResponse.successResponseWithData(res, "User Found.", {success: true});
                } else{
                    return apiResponse.unauthorizedResponse(res, "User Not Found", {success: false});
                }
            });
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
];


/**
/**

User Update.
@param {string} userName
@param {string} category
@returns {Object}
*/
exports.updateDetails = [
    auth,
    
    // Validate fields.
    body("userName", "First name must be specified.").optional().isLength({ min: 1 }).trim(),
    body("category", "Category must be specified.").optional().isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody("userName").escape(),
    sanitizeBody("category").escape(),

    // Process request after validation and sanitization.
    (req, res) => {
        try {
            // Extract the validation errors from a request.
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // Display sanitized values/errors messages.
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            } else {

                let updateData = {};
                if(req.body?.userName) {
                    updateData.userName = req.body.userName
                }

                if(req.body?.category) {
                    updateData.category = req.body.category
                }

                if (userData) {
                    UserModel.updateOne({id: req.user.id}, { $set: userData }, (err, result) => {
                        if (err) return apiResponse.unauthorizedResponse(res, "User Not Found", {success: false});
                        return apiResponse.successResponseWithData(res, "User Updated", {success: true});
                    });
                } else {
                    return apiResponse.customResponse(403, res, "Missing Data")
                }
            }
        }
        catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
    }
]





const generateAccesToken = (data) => {
    return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '3h'});
}

