const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Hết hạn!Vui lòng đăng nhập lại!" });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = {
        id: parseInt(decoded.id),
        email: decoded.email
    }; 

    next(); 
  } catch (err) {
    res.status(403).json({ error: "Không hợp lệ!" });
  }
};