/**
 * Sends a standardized JSON response.
 * 
 * @param {object} res - The Express response object.
 * @param {number} statusCode - The HTTP status code.
 * @param {string} message - A message describing the response.
 * @param {object|null} data - The data to be sent (optional).
 * @param {object|null} meta - Metadata for pagination or additional info (optional).
 * @returns {object} The JSON response.
 */
const sendResponse = (res, statusCode, message = null, data = null, meta = null) => {
    // Create a response object with the status and conditionally add properties
    const response = {
        status: statusCode < 400 ? 'success' : 'error',
    };

    // Include the message if it exists
    if (message) {
        // console.log(message);
        response.message = message;
    }

    // Include data if it exists
    if (data) {
        // console.log(data);
        response.data = data;
    }

    // Include meta if it exists
    if (meta) {
        // console.log(meta);
        response.meta = meta;
    }

    // Send the response
    return res.status(statusCode).json(response);
};

/**
 * Sends a successful response.
 * 
 * @param {object} res - The Express response object.
 * @param {string} message - A message describing the response.
 * @param {object|null} data - The data to be sent (optional).
 * @param {object|null} meta - Metadata for pagination or additional info (optional).
 */
const sendSuccessResponse = (res, message, data = null, meta = null) => {
    return sendResponse(res, 200, message, data, meta);
};

/**
 * Sends a created response.
 * 
 * @param {object} res - The Express response object.
 * @param {string} message - A message describing the response.
 * @param {object} data - The data of the created resource.
 */
const sendCreatedResponse = (res, message, data) => {
    return sendResponse(res, 201, message, data);
};

/**
 * Sends a response for resource updates.
 * 
 * @param {object} res - The Express response object.
 * @param {string} message - A message describing the response.
 * @param {object} data - The updated resource data.
 */
const sendUpdatedResponse = (res, message, data) => {
    return sendResponse(res, 200, message, data);
};

/**
 * Sends a response for resource deletion.
 * 
 * @param {object} res - The Express response object.
 * @param {string} message - A message describing the response.
 */
const sendDeletedResponse = (res, message) => {
    return sendResponse(res, 204, message);
};

/**
 * Sends a client error response.
 * 
 * @param {object} res - The Express response object.
 * @param {string} message - A message describing the error.
 * @param {object|null} errors - Validation errors or additional info (optional).
 */
const sendClientErrorResponse = (res, message, errors = null) => {
    return sendResponse(res, 400, message, null, { errors });
};

/**
 * Sends a not found error response.
 * 
 * @param {object} res - The Express response object.
 * @param {string} message - A message describing the error.
 */
const sendNotFoundResponse = (res, message) => {
    return sendResponse(res, 404, message);
};

/**
 * Sends an internal server error response.
 * 
 * @param {object} res - The Express response object.
 * @param {string} message - A message describing the error.
 */
const sendInternalServerErrorResponse = (res, message) => {
    return sendResponse(res, 500, message);
};

/**
 * Sends a response for unauthorized access.
 * 
 * @param {object} res - The Express response object.
 * @param {string} message - A message describing the error.
 */
const sendUnauthorizedResponse = (res, message) => {
    return sendResponse(res, 401, message);
};

module.exports = {
    sendResponse,
    sendSuccessResponse,
    sendCreatedResponse,
    sendUpdatedResponse,
    sendDeletedResponse,
    sendClientErrorResponse,
    sendNotFoundResponse,
    sendInternalServerErrorResponse,
    sendUnauthorizedResponse,
};
