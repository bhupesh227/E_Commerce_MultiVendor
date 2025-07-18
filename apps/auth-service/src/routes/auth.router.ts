import express, { Router } from "express";
import { addUserAddress, createShop, createStripeLink, deleteUserAddress, getSeller, getUser, getUserAddresses, handleRefreshToken, loginUser, logout, registerSeller, sellerLogin, updateUserPassword, userForgotPassword, userRegistration, userResetPassword, verifySeller, verifyUser, verifyUserForgotPassword } from "../controllers/auth.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isSeller } from "@packages/middleware/AuthorizeRole";


const router:Router = express.Router();

router.post("/user-registration",userRegistration);
router.post("/verify-user",verifyUser);
router.post("/login-user", loginUser);
router.post("/refresh-token",handleRefreshToken);
router.get("/logged-in-user",isAuthenticated,getUser);
router.post("/forget-password-user", userForgotPassword);
router.post("/verify-forgot-password-user",verifyUserForgotPassword );
router.post("/reset-password-user", userResetPassword);

router.post('/seller-registration', registerSeller);
router.post('/verify-seller', verifySeller);
router.post('/create-shop', createShop);
router.post("/create-stripe-link",createStripeLink);
router.post('/login-seller', sellerLogin);
router.get('/logged-in-seller', isAuthenticated , isSeller , getSeller);

router.get('/shipping-addresses', isAuthenticated, getUserAddresses);
router.post('/add-address', isAuthenticated, addUserAddress);
router.delete('/delete-address/:addressId', isAuthenticated, deleteUserAddress);
router.post('/change-password', isAuthenticated, updateUserPassword);

router.post("/logout", isAuthenticated, logout);


export default router;