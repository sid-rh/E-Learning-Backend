const { Sequelize, DataTypes } = require('sequelize');

const dotenv=require('dotenv');
dotenv.config();


const connectionString ='postgresql://elearning_owner:KgIpati1J3FU@ep-late-rice-a1t31vog.ap-southeast-1.aws.neon.tech/elearning?sslmode=require';

const sequelize = new Sequelize(process.env.NEON_URL,{dialect:"postgres", dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Use the root certificate
     }
  } });

module.exports=sequelize;