const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination:  (req, file, cb)=> {
      cb(null, path.join(__dirname, '../uploads/'));
    },
    filename:  (req, file, cb)=> {
      const fileName = Date.now() + path.extname(file.originalname);
      cb(null, fileName);
    }
  });
  
  const upload = multer({ storage: storage }).single('image');

  module.exports=upload;