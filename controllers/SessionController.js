const auth = require("../middlewares/jwt");
const { body, validationResult, sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const SessionModel = require("../models/SessionModel")
const streams = require("../services/LivepeerStreamService")
const createStream = streams.createStream;
const deleteStream = streams.deleteStream;

/**
 * Create a Session.
 *
 * @param {string}    sessionName
 * @param {string}    sessionDesc
 * @param {Date}      date
 * @param {Date}      startTime
 * @param {number}    duration
 * @param {number}    fee
 *
 * @returns {Object}
 */
exports.createSession = [
  auth,
  body("sessionName").isLength({ min: 1 }).trim().withMessage("Session Name is required."),
  body("sessionDesc").isLength({ min: 1 }).trim().withMessage("Session Description is required."),
  body('date').not().isEmpty().withMessage('Date is required.'),

  body('startTime').not().isEmpty().withMessage('Start time is required.'),

  body('duration').not().isEmpty().withMessage('Fee is required.').isNumeric().withMessage('Fee must be a number.'),

  body('fee').not().isEmpty().withMessage('Fee is required.').isNumeric().withMessage('Fee must be a number.'),

  sanitizeBody("sessionName").escape(),
  sanitizeBody("sessionDesc").escape(),
  sanitizeBody("date").escape(),
  sanitizeBody("startTime").escape(),
  sanitizeBody("duration").escape(),
  sanitizeBody("fee").escape(),
  (req, res) => {
    // try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
      } else {

        createStream({sessionName: req.body.sessionName}, (err, data) => {
          if (err || !data) return apiResponse.ErrorResponse(res, err)
          let session = new SessionModel({
            user: req.user._id,
            sessionName: req.body.sessionName,
            sessionDesc: req.body.sessionDesc,
            date: req.body.date,
            startTime: req.body.startTime,
            duartion: req.body.duration,
            fee: req.body.fee,
            streamKey: data.streamKey,
            streamId: data.streamId,
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
    // } catch (err) {
    //   console.log(err);
    //   return apiResponse.ErrorResponse(res, err);
    // }
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
            SessionModel.findById(req.body.sessionId, (err, session) => {
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
        SessionModel.findById(req.body.sessionId, (err, session) => {
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


/**
 * Delete a Session.
 *
 * @param {streamKey} streamKey
 *
 * @returns {boolean}
 */
exports.deleteSession = [
  auth,
  body("streamKey").isLength({ min: 1 }).trim().withMessage("StreamKey must be specified."),
  sanitizeBody("streamKey").escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
      } else {
        SessionModel.findOne({streamKey: req.body.streamKey}, {streamId: 1}, (err, session) => {
          if (err) {
            return apiResponse.ErrorResponse(res, err);
          }
          deleteStream({streamId: session.streamId}, (err, result) => {
            if (err) {
              return apiResponse.ErrorResponse(res, err);
            }
            return apiResponse.successResponseWithData(res, "Stream Deleted",  {success: true})
          })
        });
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  }
]
/**
 * Get Events
 * @param {Date} date
 */
exports.getAllSessions = [
  auth,
  body('date').not().isEmpty().withMessage('Date is required.'),
  sanitizeBody("date").escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
      } else {
        SessionModel.find({date: req.body.date}, (err, sessions) => {
          if (err) {
            return apiResponse.ErrorResponse(res, err);
          } else if (sessions) {
             return apiResponse.successResponseWithData(res, "Found Sessions", sessions)
          } else{
            return apiResponse.notFoundResponse(res, "No sessions found");
          }
        })
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  }
];



