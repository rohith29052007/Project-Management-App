/**
 * Standard API response formatter
 */
export const sendResponse = (res, statusCode, data = null, message = null) => {
    const response = {
        success: statusCode >= 200 && statusCode < 300,
        ...(data && { data }),
        ...(message && { message })
    };
    
    return res.status(statusCode).json(response);
};

/**
 * Success response helpers
 */
export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    return sendResponse(res, statusCode, data, message);
};

/**
 * Error response helper
 */
export const sendError = (res, message, statusCode = 500) => {
    return sendResponse(res, statusCode, null, message);
};

/**
 * Created response (201)
 */
export const sendCreated = (res, data, message = 'Resource created successfully') => {
    return sendResponse(res, 201, data, message);
};

/**
 * No content response (204)
 */
export const sendNoContent = (res) => {
    return res.status(204).send();
};

