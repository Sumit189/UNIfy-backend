require("dotenv").config();
const UserModel = require("../models/UserModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const { ethers } = require("ethers");
const auth = require("../middlewares/jwt");

//helper file to prepare responses.
const jwt = require("jsonwebtoken");
const apiResponse = require("../helpers/apiResponse");

/**
/**

User registration.
@param {string} uuid
@param {string} email
@returns {Object}
*/
exports.register = [
    // Validate fields
    body("uuid").isLength({ min: 1 }).trim().withMessage("UUID must be specified.").custom((value) => {
        return UserModel.findOne({uuid : value}).then((user) => {
            if (user) {
                return Promise.reject("UUID already in use");
            }
        });
    }),
    body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.").isEmail().withMessage("Email must be a valid email address.").custom((value) => {
        return UserModel.findOne({email : value}).then((user) => {
            if (user) {
                return Promise.reject("E-mail already in use");
            }
        });
    }),

    // Sanitize fields.
    sanitizeBody("uuid").escape(),
    sanitizeBody("email").escape(),

    // Process request after validation and sanitization.
    async (req, res) => {
        try {
            // Extract the validation errors from a request.
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            } else {
                // Create User object with escaped and trimmed data
                const provider = new ethers.providers.JsonRpcProvider(process.env.QUICKNODE_HTTP_URL);
                
                const collection = await provider.send("qn_fetchNFTsByCollection", {
                  collection: process.env.NFT_ADDRESS,
                  page: 1,
                  perPage: 50})

                let randomIndex = Math.floor((Math.random() * 50) + 1)
                let image = collection?.tokens?.[randomIndex]?.imageUrl

                if (collection?.tokens && image === undefined) {
                    while(image === undefined) {
                        randomIndex = Math.floor((Math.random() * 50) + 1)
                        image = collection?.tokens?.[randomIndex]?.imageUrl
                    }
                }
            
                var user = new UserModel({
                    userName: req.body.userName,
					uuid: req.body.uuid,
					email: req.body.email,
                    image: image
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
				UserModel.findOne({uuid : req.body.uuid}, {_id: 1, userName: 1, category: 1, type: 1, email: 1, image: 1}).then(user => {
					if (user) {
                        let userData = {
                            id: user._id,
                            userName: user.userName,
                            email: user.email,
                            image: user.image,
                            category: user.category
                        };
                        const accessToken = generateAccesToken(userData)
						return apiResponse.successResponseWithData(res, "User Found.", {accessToken: accessToken});
					} else{
						return apiResponse.successResponseWithData(res, "User Not Found");
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
	body("uuid").isLength({ min: 1 }).trim().withMessage("UUID must be specified."),
    body("userName").isLength({ min: 1 }).trim().withMessage("UserNam must be specified."),
	sanitizeBody("uuid").escape(),
    sanitizeBody("userName").escape(),
	(req, res) => {
		try {
			UserModel.findOne({uuid : req.body.uuid}).then(user => {
                if (user) {
                    if (user.userName)
                        return apiResponse.successResponseWithData(res, "User Found.", {success: true, userName: true});
                    else 
                        return apiResponse.successResponseWithData(res, "User Found", {success: true, userName: false});
                } else{
                    return apiResponse.successResponseWithData(res, "User not found", {success: false})
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

                if (updateData) {
                    UserModel.findOneAndUpdate({_id: req.user.id}, { $set: updateData }, {new: true}, (err, result) => {
                        if (err) return apiResponse.successResponseWithData(res, "User Not Found", {success: false});
                        let userData = {
                            id: result._id,
                            userName: result.userName,
                            email: result.email,
                            image: result.image,
                            category: result.category
                        };
                        const accessToken = generateAccesToken(userData)
                        return apiResponse.successResponseWithData(res, "User Updated", {success: true, accessToken: accessToken});
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

