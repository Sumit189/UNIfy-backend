const UserModel = require("../models/UserModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");

//helper file to prepare responses.
const jwt = require("jsonwebtoken");
const apiResponse = require("../helpers/apiResponse");

/**
/**

User registration.
@param {string} firstName
@param {string} lastName
@param {number} age
@param {string} type
@param {string} uuid
@param {string} email
@returns {Object}
*/
exports.register = [
    // Validate fields.
    
    body("firstName").isLength({ min: 1 }).trim().withMessage("First name must be specified.").isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
    body("lastName").isLength({ min: 1 }).trim().withMessage("Last name must be specified.").isAlphanumeric().withMessage("Last name has non-alphanumeric characters."),
    body("age").isInt({ min: 1 }).withMessage("Age must be a positive integer."),
    body("type").isLength({ min: 1 }).trim().withMessage("Type must be specified.").isAlphanumeric().withMessage("Type has non-alphanumeric characters."),
    body("uuid").isLength({ min: 1 }).trim().withMessage("UUID must be specified.").isAlphanumeric().withMessage("UUID has non-alphanumeric characters."),
    body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.").isEmail().withMessage("Email must be a valid email address.").custom((value) => {
        return UserModel.findOne({email : value}).then((user) => {
            if (user) {
                return Promise.reject("E-mail already in use");
            }
        });
    }),

    // Sanitize fields.
    sanitizeBody("firstName").escape(),
    sanitizeBody("lastName").escape(),
    sanitizeBody("age").toInt(),
    sanitizeBody("type").escape(),
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
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					age: req.body.age,
					type: req.body.type,
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
 * @param {string}      uuid
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
			}else {
				UserModel.findOne({uuid : req.body.uuid}, {_id: 0, firstName: 1, lastName: 1, type: 1, email: 1}).then(user => {
					if (user) {
                        let userData = {
                            firstName: user.firstName,
                            lastName: user.lastName,
                            type: user.type,
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

const generateAccesToken = (data) => {
    return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '3h'});
}

