import ActivityLog from '../models/ActivityLog.js';

// Middleware to automatically log user activities
export const logActivity = (type, action, status = 'success') => {
  return async (req, res, next) => {
    try {
      // Skip if no user (public routes)
      if (!req.user) {
        return next();
      }

      // Extract device info from user agent
      const userAgent = req.get('User-Agent') || '';
      const device = extractDevice(userAgent);
      const ip = req.ip || req.connection.remoteAddress || '';

      // Create activity log
      await ActivityLog.createLog({
        user: req.user.userId,
        type,
        action,
        status,
        ip,
        userAgent,
        device,
        details: req.body ? JSON.stringify(req.body) : '',
        metadata: {
          method: req.method,
          url: req.originalUrl,
          params: req.params,
          query: req.query
        }
      });

      next();
    } catch (error) {
      console.error('Error logging activity:', error);
      // Continue with request even if logging fails
      next();
    }
  };
};

// Helper function to extract device info from user agent
function extractDevice(userAgent) {
  const ua = userAgent.toLowerCase();
  
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  
  // Detect browser
  if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari')) browser = 'Safari';
  else if (ua.includes('edge')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';
  
  // Detect OS
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'MacOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  
  return `${browser} on ${os}`;
}

// Helper function to log specific activities
export const logUserActivity = async (userId, type, action, status = 'success', details = '', metadata = {}) => {
  try {
    await ActivityLog.createLog({
      user: userId,
      type,
      action,
      status,
      details,
      metadata
    });
  } catch (error) {
    console.error('Error logging user activity:', error);
  }
};

export default logActivity;
