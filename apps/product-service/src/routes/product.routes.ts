import express, { Router } from 'express';
import { createDiscountCode, createProduct, deleteDiscountCodes, deleteProduct, deleteProductImage, getCategories, getDiscountCodes, getShopProduct, restoreProduct, uploadProductImage } from '../controllers/product.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';
import { isSeller } from '@packages/middleware/AuthorizeRole';



const router: Router = express.Router();


router.get("/get-categories",getCategories);
router.post('/create-discount-code',isAuthenticated, isSeller, createDiscountCode);
router.get('/get-discount-codes', isAuthenticated, getDiscountCodes);
router.delete('/delete-discount-code/:id',  isAuthenticated,  isSeller,  deleteDiscountCodes);

router.post("/upload-product-image",isAuthenticated,isSeller,uploadProductImage);
router.delete("/delete-product-image", isAuthenticated, isSeller, deleteProductImage);

router.post('/create-product', isAuthenticated, isSeller, createProduct);
router.get('/get-shop-products', isAuthenticated, getShopProduct);

router.delete('/delete-product/:productId', isAuthenticated, isSeller, deleteProduct);
router.put('/restore-product/:productId', isAuthenticated, isSeller, restoreProduct);



export default router;