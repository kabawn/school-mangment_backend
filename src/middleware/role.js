const roleMiddleware = (roles) => {
    return (req, res, next) => {
      // Check if the user's role is in the allowed roles for this route
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      next();
    };
  };
  
  module.exports = roleMiddleware;
  