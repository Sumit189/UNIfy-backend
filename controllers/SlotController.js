const auth = require("../middlewares/jwt");
const SlotModel = require("../models/SlotModel");
const { body, validationResult, check } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const checkTypes = require('check-types');



/**
 * Create Slot
 *
 * @param {date}       date
 * @param {time}       start_time
 * @param {time}       end_time
 * @param {string}     category
 * @param {number}     charge
 * @param {Object}     user
 *
 * @returns {Object}
 */

exports.createSlot = [
    auth,
	body("date").isLength({ min: 1 }).trim().withMessage("Date must be specified."),
	body("start_time").isLength({ min: 1 }).trim().withMessage("Start time must be specified."),
	body("end_time").isLength({ min: 1 }).trim().withMessage("End time must be specified."),
	body("category").isLength({ min: 1 }).trim().withMessage("Category must be specified."),
	body("charge").isLength({ min: 1 }).trim().withMessage("Charge must be specified."),
	body("user").isLength({ min: 1 }).trim().withMessage("User must be specified."),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				const start = new Date(req.body.start_time);
				const end = new Date(req.body.end_time);
				const totalDuration = (end - start) / 60000;
				const newSlot = new SlotModel({
					date: req.body.date,
					start_time: req.body.start_time,
					end_time: req.body.end_time,
					category: req.body.category,
					charge: req.body.charge,
					total_duration: totalDuration,
					user: req.body.user
				});

				newSlot.save((err, slot) => {
					if (err) {
						return apiResponse.ErrorResponse(res, err);
					}
					return apiResponse.successResponseWithData(res, "Slot created successfully.", slot);
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Update Slot by ID.
 *
 * @param {string}      slotId
 * @param {Date}        [date]
 * @param {Date}        [start_time]
 * @param {Date}        [end_time]
 * @param {string}      [category]
 * @param {Number}      [charge]
 *
 * @returns {Object}
 */
exports.updateSlot = [
    auth,
    sanitizeBody("slotId").escape(),
    sanitizeBody("category").escape(),
    (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }
            SlotModel.findById(req.body.slotId).then(slot => {
                if (slot) {
                    if (req.body.date) {
                        slot.date = req.body.date;
                    }
                    if (req.body.start_time) {
                        slot.start_time = req.body.start_time;
                    }
                    if (req.body.end_time) {
                        slot.end_time = req.body.end_time;
                    }
                    if (req.body.category) {
                        slot.category = req.body.category;
                    }
                    if (req.body.charge) {
                        slot.charge = req.body.charge;
                    }
                    if (checkTypes.assigned(slot.start_time) && checkTypes.assigned(slot.end_time)) {
                        slot.total_duration = (slot.end_time - slot.start_time) / 60000;
                    }
                    slot.save().then(slot => {
                        return apiResponse.successResponseWithData(res, "Slot updated successfully.", slot);
                    });
                } else {
                    return apiResponse.notFoundResponse(res, "No slot found with this ID");
                }
            });
        } catch (err) {
            return apiResponse.ErrorResponse(res, err);
        }
    }
];
