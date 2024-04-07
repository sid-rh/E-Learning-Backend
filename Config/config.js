const dotenv=require('dotenv');
dotenv.config();

module.exports={
  "development": {
    "url": process.env.NEON_URL,
    "dialect":"postgres",
    "dialectOptions": {
      "ssl":"true"
    }
  },
  "test": {
    "url": process.env.NEON_URL,
    "dialect": "postgres",
    "dialectOptions": {
      "ssl":"true"
    }
  },
  "production": {
    "url": process.env.NEON_URL,
    "dialect": "postgres",
    "dialectOptions": {
      "ssl":"true"
    }
  }
  }