import express, { Router } from 'express';
import { deleteShop, editSellerProfile, followShop, getSellerEvents, getSellerInfo, getSellerProducts, isFollowing, markNotificationAsRead, restoreShop, sellerNotifications, unfollowShop, updateProfilePictures, UploadImage } from '../controllers/seller.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';
import { isSeller } from '@packages/middleware/AuthorizeRole';


const router: Router = express.Router();


router.get('/get-seller/:id', getSellerInfo);
router.get("/get-seller-products/:id", getSellerProducts);
router.get("/get-seller-events/:id", getSellerEvents); 
router.get("/seller-notifications", isAuthenticated, isSeller, sellerNotifications);
router.post("/mark-notification-as-read", isAuthenticated, markNotificationAsRead);

router.get("/is-following/:id", isAuthenticated, isFollowing);
router.post("/follow-shop", isAuthenticated, followShop);
router.post("/unfollow-shop", isAuthenticated, unfollowShop); 

router.delete("/delete",isAuthenticated,deleteShop);
router.patch("/restore", isAuthenticated, restoreShop);

router.post("/upload-image",isAuthenticated,UploadImage);
router.put("/update-image",isAuthenticated,updateProfilePictures);
router.put("/edit-profile",isAuthenticated,editSellerProfile);



export default router;