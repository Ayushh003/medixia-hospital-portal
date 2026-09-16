const mongoose = require('mongoose');

let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!cachedPromise) {
    const opts = {
      serverSelectionTimeoutMS: 7000,
    };
    cachedPromise = mongoose
      .connect(process.env.MONGO_URI, opts)
      .then((conn) => {
        console.log(`[MongoDB Connected]: ${conn.connection.host} / ${conn.connection.name}`);
        return conn;
      })
      .catch((error) => {
        cachedPromise = null;
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
    // Logged above
  }
};

module.exports = connectDB;

