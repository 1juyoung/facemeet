  const jwt = require('jsonwebtoken');
  require("dotenv").config();

  exports.verifyToken = (req, res, next) => {
    // 검증할 JWT
    const tokenToVerify = req.header('Authorization')?.split(' ')[1];
    console.log('Verified JWT:', tokenToVerify);
    // 인증 완료
  try {
    
    req.decoded = jwt.verify(tokenToVerify, process.env.JWT_SECRET);
    
    return next();
  } catch (error) {
    // 인증 실패
    if (error.name === 'TokenExpiredError') {
      return res.status(419).json({
        code: 419,
        message: '토큰이 만료되었습니다.',
      });
    }
    console.log('인증: ', req.decoded)
    return res.status(401).json({
      code: 401,
      message: '유효하지 않은 토큰입니다.',
    });
  }
};
