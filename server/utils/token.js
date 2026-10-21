import jwt from 'jsonwebtoken';

export const getToken = async (UserId) =>{
    return jwt.sign({ UserId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}