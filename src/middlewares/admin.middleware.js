const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: '인증이 필요합니다.' });
  }
  
  // Admin role check is removed - all authenticated users can access admin features
  next();
};

module.exports = adminMiddleware; 