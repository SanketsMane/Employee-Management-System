import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader);
    
    const token = authHeader?.replace('Bearer ', '');
    console.log('Extracted token:', token ? `${token.substring(0, 20)}...` : 'null');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    // Check if token looks like a valid JWT (has three parts separated by dots)
    if (token.split('.').length !== 3) {
      console.error('JWT malformed - token does not have 3 parts:', token);
      return res.status(401).json({
        success: false,
        message: 'Token is malformed'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully for user:', decoded.userId);
    
    // Get user from token
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.error('User not found for token:', decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'Token is not valid - user not found'
      });
    }

    // Add user to request
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.name, error.message);
    if (error.name === 'JsonWebTokenError') {
      console.error('JWT Error details:', error);
      // If it's an invalid signature, send a specific response to trigger logout
      if (error.message.includes('invalid signature')) {
        return res.status(401).json({
          success: false,
          message: 'Token signature invalid - please login again',
          code: 'INVALID_TOKEN_SIGNATURE'
        });
      }
    }
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

export default auth;
