const express=require('express');
const router=express.Router();
const auth=require('../middleware/auth');

const{enrollCourse,getEnrolledCourses}=require('../controller/enrollmentController');

router.post('',auth,enrollCourse);
router.get('',auth,getEnrolledCourses);

module.exports=router;