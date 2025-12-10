const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      msg: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validation chains for authentication
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('gymName')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Gym name must not exceed 200 characters'),
  body('gymCode')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Gym code must not exceed 50 characters'),
  handleValidationErrors
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  handleValidationErrors
];

/**
 * Validation chains for members
 */
const createMemberValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone is required')
    .matches(/^[0-9]{10}$/).withMessage('Phone must be a valid 10-digit number'),
  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
  body('dob')
    .optional()
    .isISO8601().withMessage('Date of birth must be a valid date'),
  body('plan')
    .optional()
    .isIn(['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly']).withMessage('Invalid plan type'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes must not exceed 500 characters'),
  handleValidationErrors
];

const updateMemberValidation = [
  param('id')
    .isMongoId().withMessage('Invalid member ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/).withMessage('Phone must be a valid 10-digit number'),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),
  body('plan')
    .optional()
    .isIn(['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly']).withMessage('Invalid plan type'),
  handleValidationErrors
];

/**
 * Validation chains for payments
 */
const createPaymentValidation = [
  body('memberId')
    .notEmpty().withMessage('Member ID is required')
    .isMongoId().withMessage('Invalid member ID'),
  body('plan')
    .notEmpty().withMessage('Plan is required')
    .isIn(['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly']).withMessage('Invalid plan type'),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('method')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['UPI', 'Cash', 'Card']).withMessage('Invalid payment method'),
  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid date'),
  handleValidationErrors
];

/**
 * Validation chains for attendance
 */
const markAttendanceValidation = [
  body('memberId')
    .notEmpty().withMessage('Member ID is required')
    .isMongoId().withMessage('Invalid member ID'),
  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid date'),
  body('checkInTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Check-in time must be in HH:MM format'),
  handleValidationErrors
];

/**
 * Validation for query parameters
 */
const mongoIdParamValidation = [
  param('id')
    .isMongoId().withMessage('Invalid ID'),
  handleValidationErrors
];

const dateQueryValidation = [
  query('month')
    .optional()
    .matches(/^\d{4}-\d{2}$/).withMessage('Month must be in YYYY-MM format'),
  query('startDate')
    .optional()
    .isISO8601().withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601().withMessage('End date must be a valid date'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  registerValidation,
  loginValidation,
  changePasswordValidation,
  createMemberValidation,
  updateMemberValidation,
  createPaymentValidation,
  markAttendanceValidation,
  mongoIdParamValidation,
  dateQueryValidation
};
