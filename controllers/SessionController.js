const auth = require("../middlewares/jwt");
const { body, validationResult, sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const SessionModel = require("../models/SessionModel")

/**
 * Create a Session.
 *
 * @param {ObjectId}      user
 * @param {Array}         attendees
 * @param {ObjectId}      slot
 * @param {string}        status
 *
 * @returns {Object}
 */
exports.createSession = [
  auth,
  body("user").isLength({ min: 1 }).trim().withMessage("User is required."),
  body("attendees").isArray().withMessage("Attendees must be an array."),
  body("slot").isLength({ min: 1 }).trim().withMessage("Slot is required."),
  sanitizeBody("user").escape(),
  sanitizeBody("attendees").escape(),
  sanitizeBody("slot").escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
      } else {
        let session = new SessionModel({
          user: req.body.user,
          attendees: req.body.attendees,
          slot: req.body.slot
        });

        session.save((err, session) => {
          if (err) {
            return apiResponse.ErrorResponse(res, err);
          }
          return apiResponse.successResponseWithData(res, "Session created successfully.", session);
        });
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

/**
 * Add User to Attendees in a Session by UUID.
 *
 * @param {string}      sessionId
 * @param {string}      uuid
 *
 * @returns {Object}
 */
exports.addAttendee = [
  auth,
  body("sessionId").isLength({ min: 1 }).trim().withMessage("Session ID must be specified."),
  body("uuid").isLength({ min: 1 }).trim().withMessage("UUID is required."),
  sanitizeBody("sessionId").escape(),
  sanitizeBody("uuid").escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
      } else {
        UserModel.findOne({ uuid: req.body.uuid }, (err, user) => {
          if (err) {
            return apiResponse.ErrorResponse(res, err);
          } else if (user) {
            SessionModel.findById(req.params.sessionId, (err, session) => {
              if (err) {
                return apiResponse.ErrorResponse(res, err);
              } else if (session) {
                session.attendees.push(user._id);
                session.save((err, session) => {
                  if (err) {
                    return apiResponse.ErrorResponse(res, err);
                  }
                  return apiResponse.successResponseWithData(res, "User added to attendees successfully.", session);
                });
              } else {
                return apiResponse.notFoundResponse(res, "Session not found");
              }
            });
          } else {
            return apiResponse.notFoundResponse(res, "User not found");
          }
        });
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

/**
 * Remove User from Attendees in a Session by User ID.
 *
 * @param {string}      sessionId
 * @param {string}      userId
 *
 * @returns {Object}
 */
exports.removeAttendee = [
  body("sessionId").isLength({ min: 1 }).trim().withMessage("Session ID must be specified."),
  body("userId").isLength({ min: 1 }).trim().withMessage("User ID is required."),
  sanitizeBody("sessionId").escape(),
  sanitizeBody("userId").escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
      } else {
        SessionModel.findById(req.params.sessionId, (err, session) => {
          if (err) {
            return apiResponse.ErrorResponse(res, err);
          } else if (session) {
            const attendeeIndex = session.attendees.indexOf(req.body.userId);
            if (attendeeIndex !== -1) {
              session.attendees.splice(attendeeIndex, 1);
              session.save((err, session) => {
                if (err) {
                  return apiResponse.ErrorResponse(res, err);
                }
                return apiResponse.successResponseWithData(res, "User removed from attendees successfully.", session);
              });
            } else {
              return apiResponse.notFoundResponse(res, "User not found in attendees.");
            }
          } else {
            return apiResponse.notFoundResponse(res, "Session not found");
          }
        });
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  }
];


