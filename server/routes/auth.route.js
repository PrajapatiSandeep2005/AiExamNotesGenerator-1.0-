import express from 'express';
import {
    emailLogin,
    emailRegister,
    googleAuth,
    logOut,
} from '../controllers/auth.controller.js';

const authRouter = express.Router();

authRouter.post('/google', googleAuth);
authRouter.post('/register', emailRegister);
authRouter.post('/login', emailLogin);
authRouter.post('/logout', logOut);

export default authRouter;
