import express, { Router } from 'express';
import { createDiscountCode, createEvent, createProduct, deleteDiscountCodes, deleteProduct, deleteProductImage, getAllEvents, getAllProducts, getCategories, getDiscountCodes, getFilteredEvents, getFilteredProducts, getFilteredShops, getProductDetails, getShopEvents, getShopProduct, restoreProduct, searchProducts, topShops, uploadEventImage, uploadProductImage } from '../controllers/product.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';
import { isSeller } from '@packages/middleware/AuthorizeRole';



const router: Router = express.Router();


router.get("/get-categories",getCategories);
router.post('/create-discount-code',isAuthenticated, isSeller, createDiscountCode);
router.get('/get-discount-codes', isAuthenticated, getDiscountCodes);
router.delete('/delete-discount-code/:id',  isAuthenticated,  isSeller,  deleteDiscountCodes);

router.post("/upload-product-image",isAuthenticated,isSeller,uploadProductImage);
router.post("/upload-event-image", isAuthenticated, isSeller, uploadEventImage);
router.delete("/delete-product-image", isAuthenticated, isSeller, deleteProductImage);

router.post('/create-product', isAuthenticated, isSeller, createProduct);
router.post('/create-event', isAuthenticated, isSeller, createEvent);
router.get('/get-shop-products', isAuthenticated, getShopProduct);
router.get('/get-shop-events', isAuthenticated, isSeller, getShopEvents);

router.delete('/delete-product/:productId', isAuthenticated, isSeller, deleteProduct);
router.put('/restore-product/:productId', isAuthenticated, isSeller, restoreProduct);

router.get('/get-all-products', getAllProducts);
router.get('/get-product/:slug', getProductDetails);

router.get('/get-filtered-products', getFilteredProducts);
router.get('/get-filtered-offers', getFilteredEvents);
router.get('/get-filtered-shops', getFilteredShops);
router.get('/search-products', searchProducts);

router.get('/get-all-events', getAllEvents);
router.get('/top-shops', topShops);

export default router;