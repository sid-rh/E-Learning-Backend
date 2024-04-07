const jwt = require("jsonwebtoken");
const { DataTypes } = require('sequelize');
const Sequelize=require('../Config/Sequelize.js');
const userFn = require('../models/user.js');
const User = userFn(Sequelize,DataTypes);
const dotenv = require('dotenv');

dotenv.config();

const isAdmin=async(req,res,next)=>
{
    try {
        if (!req.currentUser) {
            return res.status(401).send('Unauthorized');
        }
        
        const user = await User.findOne({ where: { email: req.currentUser.email } });
        if (!user) {
            return res.status(401).send('Unauthorized');
        }

        if (user.email === 'admin@admin.com') {
            next();
        } else {
            return res.status(403).send('Forbidden');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = isAdmin;
