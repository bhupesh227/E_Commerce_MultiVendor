import express, { Router } from "express";
import { loginUser, userForgotPassword, userRegistration, userResetPassword, verifyUser, verifyUserForgotPassword } from "../controllers/auth.controller";


const router:Router = express.Router();

router.post("/user-registration",userRegistration);
router.post("/verify-user",verifyUser);
router.post("/login-user", loginUser);
router.post("/forget-password-user", userForgotPassword);
router.post("/verify-forgot-password-user",verifyUserForgotPassword );
router.post("/reset-password-user", userResetPassword);


export default router;