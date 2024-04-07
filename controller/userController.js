const Sequelize=require('../Config/Sequelize.js');
const userFn = require('../models/user.js');
const logger = require('../Config/logger.js');
const bcrypt=require('bcrypt');
const dotenv=require('dotenv');
const jwt=require('jsonwebtoken');
const upload=require('../Config/Multer');
const fs = require('fs');
const { DataTypes } = require('sequelize');
const User = userFn(Sequelize,DataTypes);
const cloudinary=require('../Config/cloudinary.js');
const resend=require('../Config/Resend.js');
const path = require('path'); 

dotenv.config();

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, '../uploads/profiles');
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });

// const upload = multer({ storage: storage });

const registrationConformationMail=async(email)=>
{
  try {
    
    const{data,error}=await resend.emails.send({
      from: process.env.RESEND_DOMAIN,
      to: email,
      subject: 'Registration Confirmation',
      html: '<p>Thank you for registering with our platform!</p>'
    });
    logger.info('Registration confirmation email sent to', email);
    logger.info({data,error});
  } catch (error) {
    console.error('Error sending registration confirmation email:', error);
    throw new Error(error);
  }
}


const register = async (req, res) => {
    try {
        const existingUser = await User.findOne({ where: { email: req.body.email } });
        const {email}=req.body;
        if (existingUser) {
          return res.status(400).json({ error: 'Email is already registered' });
        }
    
       
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
        
        let profilePictureUrl = null;
        if (req.file) {
          const profilePicturePath = req.file.path;
          const data=await cloudinary.uploader.upload(profilePicturePath,(err,result)=>
          {
            if(err)
            {
              logger.info(err);
              console.error(err);
              return res.status(500).json({message:"Error uploading image to the cloud"});
            }

            // profilePictureUrl=result.url;
            return result;
           
          });
          profilePictureUrl=data.url;
          
        }
    
        
        const newUser = await User.create({
          name: req.body.name,
          email: req.body.email,
          password: hashedPassword,
          profile_picture: profilePictureUrl 
        });
        
        await registrationConformationMail(email);
        
        const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, { httpOnly: true });

        logger.info('User registered successfully');
        res.status(201).json({ message: 'User registered successfully', user: newUser });
      } catch (error) {
        logger.info(error);
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
  };

  const login = async (req, res) => {
    try {
      
      const user = await User.findOne({ where: { email: req.body.email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      
      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.cookie('token', token, { httpOnly: true });
  
      logger.info('Login Successful')
      res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
      logger.info(error);
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  const logout = async (req, res) => {
    try {
      res.clearCookie('token');
      req.currentUser=null;
      
      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      logger.info(error);
      console.error('Error logging out:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

const viewProfile = async (req, res) => {
    try {
      // Fetch user profile excluding password field
      const user = await User.findByPk(req.currentUser.id, { attributes: { exclude: ['password'] } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json({ user });
    } catch (error) {
      logger.info(error);
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

const updateProfile = async (req, res) => {
  try {
    
    const user = req.currentUser;

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    
    if(req.body.name) user.name = req.body.name;

    
    let profilePictureUrl = user.profile_picture;
    
    if (req.file) {
        const profilePicturePath = req.file.path;
        
        const uploadResult = await cloudinary.uploader.upload(profilePicturePath);
        profilePictureUrl = uploadResult.url;

        if (user.profile_picture) {
            const publicId = user.profile_picture.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        
        if (user.profile_picture) {
            const filename = user.profile_picture.split('/').pop();
            const oldProfilePicturePath = path.join(__dirname, '../uploads/', filename);
            if (fs.existsSync(oldProfilePicturePath)) {
                fs.unlinkSync(oldProfilePicturePath);
            }
        }
    }
    if(req.body.removeProfilePicture&&!req.file)
      {
        if (user.profile_picture) {
          const publicId = user.profile_picture.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
      }

      
      if (user.profile_picture) {
          const filename = user.profile_picture.split('/').pop();
          const oldProfilePicturePath = path.join(__dirname, '../uploads/', filename);
          if (fs.existsSync(oldProfilePicturePath)) {
              fs.unlinkSync(oldProfilePicturePath);
          }
      } 
      profilePictureUrl=null;
      }

    user.profile_picture = profilePictureUrl;

    await user.save();
    
    logger.info('Profile Updated Successfully');
    res.status(200).json({ message: 'Profile updated successfully', user });
} catch (error) {
    logger.info(error);
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
}
  };

const forgotPassword=async(req,res)=>
{
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  
  if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate a unique token (JWT) for password reset
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  

  
  const resetLink = `${process.env.DOMAIN}/user/resetPassword?token=${token}`;
  try {
    await resend.emails.send({
      from: process.env.RESEND_DOMAIN,
      to: email,
      subject: 'Password Reset Request',
      html: `Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.`
    });
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    logger.info(error);
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const resetPassword=async(req,res)=>
{
  const { newPassword } = req.body;
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.userId;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.update({ password: hashedPassword }, { where: { id:userId } });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    logger.info(error);
    console.error('Error resetting password:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Token expired. Please request a new password reset.' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId=req.currentUser.id;

  try {
    // Find the user in the database
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({ password: hashedPassword });

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.info(error);
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


  module.exports = {
    register,
    login,
    viewProfile,
    updateProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    logout
  };