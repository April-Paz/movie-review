const { decodeToken } = require("../jwt-utils");

const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization;
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: "Access token required"
        });
      }

      const decoded = decodeToken(token);
      
      if (!decoded) {
        return res.status(401).json({
          success: false,
          error: "Invalid or expired token"
        });
      }

      // Check if user has required role
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          error: `Access denied. Required roles: ${allowedRoles.join(', ')}`
        });
      }

      req.account = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: "Invalid token"
      });
    }
  };
};

module.exports = authorize;