const Sequelize=require('../Config/Sequelize.js');
const { DataTypes } = require('sequelize');
const userFn = require('../models/user.js');
const courseFn=require('../models/course.js');
const enrollmentFn=require('../models/enrollment.js');
const User = userFn(Sequelize,DataTypes);
const Course=courseFn(Sequelize,DataTypes);
const Enrollment=enrollmentFn(Sequelize,DataTypes);
const dotenv=require('dotenv');


dotenv.config();

const enrollCourse=async(req,res)=>
{
    try {
        const { courseId } = req.body;
        const userId=req.currentUser.id;
    
        const enrollmentExists = await Enrollment.findOne({
          where: { user_id: userId, course_id: courseId }
        });
    
        if (enrollmentExists) {
          return res.status(400).json({ message: 'User is already enrolled in this course.' });
        }
    
        await Enrollment.create({
          enrollment_date: new Date(),
          user_id: userId,
          course_id: courseId
        });
    
        await Course.increment('enrolled', { where: { id: courseId } });
    
        await User.increment('enrolled', { where: { id: userId } });
        
        logger.info('Course enrolled successfully');
        res.status(200).json({ message: 'Course enrolled successfully.' });
      } catch (error) {
        logger.info(error);
        console.error('Error enrolling course:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
}

const getEnrolledCourses=async(req,res)=>
{
    try {
        const userId=req.currentUser.id;

        const enrollments = await Enrollment.findAll({
            where: { user_id: userId },
          });
      
          
          const courseIds = enrollments.map(enrollment => enrollment.course_id);
      
          // Fetch courses associated with the extracted course IDs
          const courses = await Course.findAll({
            where: { id: courseIds },
          });
        logger.info(error);  
        res.status(200).json(courses);
    } catch (error) {
        logger.info(error);
        console.error('Error fetching enrolled courses:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports={
    enrollCourse,
    getEnrolledCourses,
}