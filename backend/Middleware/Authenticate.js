import jwt from 'jsonwebtoken';
import User from '../Schema/UserSchema.js';

const Authenticate = async (req, res, next) => {
    // console.log('cookie', req.cookies);

    try {
        const token = req.cookies.Token;
        if (!token) {
            return res.status(401).json({ msg: 'Unauthorized: No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ msg: 'Unauthorized: User not found.' });
        }

        req.user = user; 
        next(); 
    } catch (error) {
        return res.status(401).json({ msg: 'Unauthorized: Invalid token.' });
    }
};

export default Authenticate;