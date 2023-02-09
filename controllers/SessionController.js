const auth = require("../middlewares/jwt");
const { body, validationResult, sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const SessionModel = require("../models/SessionModel")
const createStream = require("../services/LivepeerStreamService")

/**
 * Create a Session.
 *
 * @param {string}    sessionName
 * @param {string}    sessionDesc
 * @param {Date}      date
 * @param {Date}      startTime
 * @param {Date}      endTime
 * @param {number}    fee
 *
 * @returns {Object}
 */
exports.createSession = [
  auth,
  body("sessionName").isLength({ min: 1 }).trim().withMessage("Session Name is required."),
  body("sessionDesc").isLength({ min: 1 }).trim().withMessage("Session Description is required."),
  body('date').isEmpty().withMessage('Date is required.').custom((value) => {
    return value instanceof Date;
  }).withMessage('Invalid date format.'),

  body('startTime').isEmpty().withMessage('Start time is required.')  .custom((value) => {
    return value instanceof Date;
  })
  .withMessage('Invalid start time format.'),

  body('endTime').isEmpty().withMessage('End time is required.').custom((value, { req }) => {
      return value > req.body.startTime;
  }).withMessage('End time must be greater than start time.').custom((value) => {
      return value instanceof Date;
  }).withMessage('Invalid end time format.'),

  body('fee').isEmpty().withMessage('Fee is required.').isNumeric().withMessage('Fee must be a number.'),

  sanitizeBody("sessionName").escape(),
  sanitizeBody("sessionDesc").escape(),
  sanitizeBody("date").escape(),
  sanitizeBody("startTime").escape(),
  sanitizeBody("endTime").escape(),
  sanitizeBody("fee").escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
      } else {

        createStream({sessionName: sessionName}, (err, data) => {
          if (err) return apiResponse.ErrorResponse(res, err)

          let session = new SessionModel({
            user: req.user._id,
            sessionName: req.body.sessionName,
            sessionDesc: req.body.sessionDesc,
            date: req.body.date,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            fee: req.body.fee,
            streamKey: data.streamKey,
            streamDetails: data.streamDetails
          });

          session.save((err, session) => {
            if (err) {
              return apiResponse.ErrorResponse(res, err);
            }
            return apiResponse.successResponseWithData(res, "Session created successfully.", session);
          });
        })
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
  sanitizeBody("sessionId").escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
      } else {
        UserModel.findOne({ uuid: req.user._id }, (err, user) => {
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
 *
 * @returns {Object}
 */
exports.removeAttendee = [
  body("sessionId").isLength({ min: 1 }).trim().withMessage("Session ID must be specified."),
  sanitizeBody("sessionId").escape(),
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
            const attendeeIndex = session.attendees.indexOf(req.user._id);
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


