const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
  try {
    await mongoose.connect(
      db,

      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      }
    );
    console.log('mongodb connected...');
  } catch (err) {
    // console.error(err.mossage);
    // //exit process with failure
    // process.exit(1);
    console.log('THIS IS FAILURE:', err);
  }
};

module.exports = connectDB;
