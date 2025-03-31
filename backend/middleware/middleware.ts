import jwt from 'jsonwebtoken';
import {Request, Response, NextFunction} from 'express'

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.token
    

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const secretKey = process.env.SECRET_KEY || '' ; 
        const decoded = jwt.verify(token, secretKey); 
        req.user = decoded;
        next(); 

    } catch (err) {
        return res.status(401).json({ error: 'Invalid token.' });
    }
}
