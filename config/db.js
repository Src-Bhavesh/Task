const mongoose = require("mongoose")


const DBConnect = async()=>{
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connected")
  } catch (err) {
    console.log(err);
  }
}

module.exports=DBConnect;