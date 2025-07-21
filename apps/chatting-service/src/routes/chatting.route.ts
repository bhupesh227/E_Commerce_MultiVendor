import isAuthenticated from '@packages/middleware/isAuthenticated';
import express from 'express';
import { fetchMessages, fetchSellerMessages, getSellerConversation, getUserConversations, newConversation } from '../controllers/chatting.controller';
import { isSeller } from '@packages/middleware/AuthorizeRole';


const router = express.Router();


router.post('/create-user-conversationGroup',isAuthenticated,newConversation);
router.get('/get-user-conversations',isAuthenticated, getUserConversations);

router.get('/get-seller-conversations', isAuthenticated, isSeller,getSellerConversation);
router.get('/get-seller-messages/:conversationId', isAuthenticated, isSeller, fetchSellerMessages);

router.get('/get-messages/:conversationId', isAuthenticated, fetchMessages);


export default router;
