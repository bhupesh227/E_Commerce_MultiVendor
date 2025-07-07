import express, { Router } from "express";
import { createShop, createStripeLink, getSeller, getUser, handleRefreshToken, loginUser, registerSeller, sellerLogin, userForgotPassword, userRegistration, userResetPassword, verifySeller, verifyUser, verifyUserForgotPassword } from "../controllers/auth.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isSeller } from "@packages/middleware/AuthorizeRole";


const router:Router = express.Router();

router.post("/user-registration",userRegistration);
router.post("/verify-user",verifyUser);
router.post("/login-user", loginUser);
router.post("/refresh-token-user",handleRefreshToken);
router.get("/logged-in-user",isAuthenticated,getUser);
router.post("/forget-password-user", userForgotPassword);
router.post("/verify-forgot-password-user",verifyUserForgotPassword );
router.post("/reset-password-user", userResetPassword);

router.post('/seller-registration', registerSeller);
router.post('/verify-seller', verifySeller);
router.post('/create-shop', createShop);
router.post("/create-stripe-link",createStripeLink);
router.post('/login-seller', sellerLogin);
router.post('/logged-in-seller', isAuthenticated , isSeller , getSeller);


export default router;