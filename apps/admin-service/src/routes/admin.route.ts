import { isAdmin } from "@packages/middleware/AuthorizeRole";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import express,{ Router } from "express";
import { addCategory, addNewAdmin, addSubCategory, getAllAdmins, getAllCustomizations, getAllEvents, getAllNotifications, getAllProducts, getAllSellers, getAllUsers, getAllUsersNotifications, uploadBanner, uploadLogo } from "../controllers/admin.controller";
import multer from 'multer';


const router: Router = express.Router();
const upload = multer();



router.get('/get-all-products', isAuthenticated, isAdmin, getAllProducts);
router.get('/get-all-events', isAuthenticated, isAdmin, getAllEvents);

router.get('/get-all-admins', isAuthenticated, isAdmin, getAllAdmins);
router.put('/add-new-admin', isAuthenticated, isAdmin, addNewAdmin);

router.get('/get-all-users', isAuthenticated, isAdmin, getAllUsers);
router.get('/get-all-sellers', isAuthenticated, isAdmin, getAllSellers);
router.get('/get-all', getAllCustomizations);
router.get('/get-all-notifications', isAuthenticated, isAdmin, getAllNotifications);
router.get('/get-user-notifications', isAuthenticated, getAllUsersNotifications);


router.post('/add-category', isAuthenticated, isAdmin, addCategory);
router.post('/add-subcategory', isAuthenticated, isAdmin, addSubCategory);
router.post('/upload-logo', isAuthenticated, isAdmin, upload.single('file'), uploadLogo);
router.post('/upload-banner', isAuthenticated, isAdmin, upload.single('file'), uploadBanner);


export default router;