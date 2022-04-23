import jwt from "jsonwebtoken";

function authenticateToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(300).redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, 'secret');
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    
    next();
}

export default authenticateToken;