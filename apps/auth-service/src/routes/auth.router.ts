import express, { Router } from "express";
import { getUser, handleRefreshToken, loginUser, userForgotPassword, userRegistration, userResetPassword, verifyUser, verifyUserForgotPassword } from "../controllers/auth.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";


const router:Router = express.Router();

router.post("/user-registration",userRegistration);
router.post("/verify-user",verifyUser);
router.post("/login-user", loginUser);
router.post("/refresh-token-user",handleRefreshToken);
router.get("/logged-in-user",isAuthenticated,getUser);
router.post("/forget-password-user", userForgotPassword);
router.post("/verify-forgot-password-user",verifyUserForgotPassword );
router.post("/reset-password-user", userResetPassword);


export default router;