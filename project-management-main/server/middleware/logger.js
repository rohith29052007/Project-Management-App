import morgan from 'morgan';

/**
 * Custom morgan token for request ID
 */
morgan.token('id', (req) => req.id || '-');

/**
 * Custom log format
 */
const logFormat = ':method :url :status :response-time ms - :res[content-length]';

/**
 * Development logger
 */
export const devLogger = morgan(logFormat);

/**
 * Production logger (more detailed)
 */
export const prodLogger = morgan('combined', {
    skip: (req, res) => res.statusCode < 400
});

/**
 * Request logger middleware
 */
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const log = {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            timestamp: new Date().toISOString()
        };
        
        if (res.statusCode >= 400) {
            console.error('Request Error:', log);
        } else {
            console.log('Request:', log);
        }
    });
    
    next();
};

