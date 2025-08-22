const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ status: false, message: "No token" });

  jwt.verify(token, "secret", (err, decoded) => {
    if (err) return res.status(401).json({ status: false, message: "Invalid token" });
    req.user = decoded;
    next();
  });
}

module.exports = verifyToken;
