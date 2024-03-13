import express from 'express';
import * as auth from '../controllers/authController.js';
import * as post from '../controllers/postController.js';

const router = express.Router();

// Define routes

router.get('/login', auth.login);
router.post('/login', auth.verifyLogin);
router.get('/register', auth.register);
router.post('/register', auth.verifyRegister);
router.get('/logout', auth.logout);
router.post('/changeRole', auth.changeRole);

router.get('/changePassword', auth.changePassword);
router.post('/updatePassword', auth.updatePassword);


router.get('/', auth.isAuthenticated, post.home);
router.get('/products/:page', post.loadPosts);
router.post('/api/products', post.getProducts);



router.post('/addToCart/:productId', post.addToCart);
router.get('/cart', post.viewCart);
router.post('/cart/clear', post.clearCart);
router.post('/cart/delete/:itemId', post.deleteCartItem); 
router.post('/cart/addQuantity/:itemId', post.addQuantityToCartItem);
router.post('/cart/minusQuantity/:itemId', post.minusQuantityToCartItem);
router.post('/cart/purchase', post.purchase); 


router.get('/userProfile', post.viewProfile);

            
export default router;
