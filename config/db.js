const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_DB_URL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected')
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

module.exports = connectDB
