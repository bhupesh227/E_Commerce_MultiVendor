import express, { Router } from "express";
import { addUserAddress, createShop, createStripeLink, deleteUserAddress, getAdmin, getLayoutData, getSeller, getUser, getUserAddresses, handleRefreshToken, loginAdmin, loginUser,  logoutAdmin,  logOutSeller,  logOutUser, registerSeller, sellerLogin, updateUserAvatar, updateUserPassword, userForgotPassword, userRegistration, userResetPassword, verifySeller, verifyUser, verifyUserForgotPassword } from "../controllers/auth.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isAdmin, isSeller } from "@packages/middleware/AuthorizeRole";
import multer from 'multer';

const router:Router = express.Router();
const upload = multer();

router.post("/user-registration",userRegistration);
router.post("/verify-user",verifyUser);
router.post("/login-user", loginUser);
router.post("/refresh-token",handleRefreshToken);
router.get("/logged-in-user",isAuthenticated,getUser);
router.post("/forget-password-user", userForgotPassword);
router.post("/verify-forgot-password-user",verifyUserForgotPassword );
router.post("/reset-password-user", userResetPassword);
router.get("/logout-user", isAuthenticated, logOutUser);

router.post('/seller-registration', registerSeller);
router.post('/verify-seller', verifySeller);
router.post('/create-shop', createShop);
router.post("/create-stripe-link",createStripeLink);
router.post('/login-seller', sellerLogin);
router.get("/logout-seller", isAuthenticated, isSeller, logOutSeller);
router.get('/logged-in-seller', isAuthenticated , isSeller , getSeller);

router.get('/shipping-addresses', isAuthenticated, getUserAddresses);
router.post('/add-address', isAuthenticated, addUserAddress);
router.delete('/delete-address/:addressId', isAuthenticated, deleteUserAddress);
router.post('/change-password', isAuthenticated, updateUserPassword);


router.post("/login-admin",loginAdmin);
router.get("/logged-in-admin", isAuthenticated,isAdmin,getAdmin);
router.get("/logout-admin", isAuthenticated, logoutAdmin);

router.get('/get-layouts', getLayoutData);
router.post('/update-avatar', isAuthenticated, upload.single('avatar'), updateUserAvatar);



export default router;