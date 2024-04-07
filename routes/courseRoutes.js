const express=require('express');
const router=express.Router();
const auth=require('../middleware/auth');
const isAdmin=require('../middleware/isAdmin');

const{getCourses,createCourse,updateCourse,deleteCourse}=require('../controller/courseController');

router.post('/get',getCourses);
router.post('/',auth,isAdmin,createCourse);
router.put('/:id',auth,isAdmin,updateCourse);
router.delete('/:id',auth,isAdmin,deleteCourse);

module.exports=router;


