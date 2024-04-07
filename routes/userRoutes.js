const express=require('express');
const router=express.Router();
const auth=require('../middleware/auth');
const upload=require('../Config/Multer');
const {validateRegistration}=require('../middleware/validateRegistration');

const{register,login,viewProfile,updateProfile,forgotPassword, resetPassword,changePassword, logout}=require('../controller/userController');

router.post('/register',upload,validateRegistration, register);
router.post('/login',login);
router.post('/logout',auth,logout);
router.post('/forgotPassword',forgotPassword);
router.post('/resetPassword',resetPassword);
router.post('/changePassword',auth,changePassword);
router.post('/update',auth,upload,updateProfile);
router.get('/profile',auth,viewProfile);

module.exports=router;