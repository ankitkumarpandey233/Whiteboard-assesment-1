// Centralized error handling - keeps our routes clean
const errorHandler = (err, req, res, next) => {
    // Log it for debugging
    console.error(`[${new Date().toISOString()}] Error:`, err.stack);
  
    // Mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
  
    // Duplicate key error (like room code already exists)
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
  
    // JWT errors (if we add auth later)
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  
    // Default error
    const status = err.status || 500;
    const message = err.message || 'Something went wrong!';
    
    res.status(status).json({
      success: false,
      message,
      // Only show stack trace in dev mode
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  };
  
  module.exports = errorHandler;