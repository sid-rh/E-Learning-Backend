const express=require('express');
const bodyParser=require('body-parser');
const dotenv=require('dotenv');
const cookieParser=require('cookie-parser');
const sequelize=require('./Config/Sequelize');
const multer = require('multer');
const path = require('path');
const upload = multer();
const morgan = require('morgan');
const logger = require('./Config/logger');

const userRoutes=require('./routes/userRoutes');
const courseRoutes=require('./routes/courseRoutes');
const enrollmentRoutes=require('./routes/enrollmentRoutes');


const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(__dirname));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
dotenv.config();

sequelize
  .authenticate()
  .then(() => {
    console.log('Connected to the database');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

  app.use('/user',userRoutes);
  app.use('/course',courseRoutes);
  app.use('/enrollment',enrollmentRoutes);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});