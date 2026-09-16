const mongoose = require('mongoose');

let cachedPromise = null;
let lastMongoError = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!cachedPromise) {
    const opts = {
      serverSelectionTimeoutMS: 5000,
    };
    cachedPromise = mongoose
      .connect(process.env.MONGO_URI, opts)
      .then((conn) => {
        lastMongoError = null;
        console.log(`[MongoDB Connected]: ${conn.connection.host} / ${conn.connection.name}`);
        return conn;
      })
      .catch((error) => {
        cachedPromise = null;
        lastMongoError = error.message;
        console.error(`MongoDB Connection Error: ${error.message}`);
        if (!process.env.VERCEL) {
          process.exit(1);
        }
        throw error;
      });
  }

  try {
    await cachedPromise;
  } catch (err) {
    lastMongoError = err.message;
    throw err;
  }
};

const getLastError = () => lastMongoError;

module.exports = connectDB;
module.exports.getLastError = getLastError;

