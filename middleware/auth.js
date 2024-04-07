const jwt = require("jsonwebtoken");
const { DataTypes } = require('sequelize');
const Sequelize=require('../Config/Sequelize.js');
const userFn = require('../models/user.js');
const User = userFn(Sequelize,DataTypes);
const dotenv = require('dotenv');

dotenv.config();

const auth=async(req,res,next)=>
{
    let token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log(decoded);
      
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      if (!user) {
        return res.status(401).send('Unauthorized, user not found');
      }
      
      req.currentUser = user;
      next();
    } catch (error) {
      return res.status(401).send('Unauthorized, invalid token');
    }
  } else {
    return res.status(401).send({ error: "Unauthorized, no token" });
  }
}

module.exports = auth;
