const Sequelize=require('../Config/Sequelize.js');
const { DataTypes } = require('sequelize');
const userFn = require('../models/user.js');
const courseFn=require('../models/course.js');
const User = userFn(Sequelize,DataTypes);
const Course=courseFn(Sequelize,DataTypes);
const dotenv=require('dotenv');
const jwt=require('jsonwebtoken');

dotenv.config();

const getCourses=async(req,res)=>
{
    try {
      const page = parseInt(req.body.page) || 1; // Current page
      const limit = parseInt(req.body.limit) || 10; // Number of records per page
      const offset = (page - 1) * limit; // Offset calculation for pagination
  
      // Filtering options
      const { category, level } = req.body;
      const whereClause = {};
      if (category) whereClause.category = category;
      if (level) whereClause.level = level;
  
      const orderBy = [['enrolled', 'DESC']];

      const courses = await Course.findAndCountAll({
        where: whereClause,
        order: orderBy,
        limit: limit,
        offset: offset,
      });
      res.status(200).json({
        page: page,
        totalCourses: courses.count,
        totalPages: Math.ceil(courses.count / limit),
        courses: courses.rows,
      });
    } catch (error) {
        logger.info(error);
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createCourse=async(req,res)=>
{
    try {
        const { title, description, category, level, instructor } = req.body;
        const course = await Course.create({ title, description, category, level, instructor });
        logger.info('Course created successfully');
        res.status(200).json({ message: 'Course created successfully', course });
    } catch (error) {
        logger.info(error);
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateCourse = async (req, res) => {
    const { id } = req.params;
    try {
      const [updated] = await Course.update(req.body, {
        where: { id }
      });
      if (updated) {
        const updatedCourse = await Course.findOne({ where: { id } });
        logger.info('Course updated successfully');
        res.status(200).json({message:"Course updated successfully", updatedCourse });
      } else {
        res.status(404).json({ error: 'Course not found' });
      }
    } catch (error) {
      logger.info(error);
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

const deleteCourse = async (req, res) => {
    const { id } = req.params;
    try {
      const deleted = await Course.destroy({
        where: { id }
      });
      if (deleted) {
        res.json({ message: 'Course deleted successfully' });
      } else {
        res.status(404).json({ error: 'Course not found' });
      }
    } catch (error) {
      logger.info(error);
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

module.exports={
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse,
}