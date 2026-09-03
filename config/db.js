const mongoose = require("mongoose")


const DBConnect = async () => {
  try {
    await mongoose.connect("mongodb+srv://bhaveshpandey:webdevproject@cluster0.wz63xid.mongodb.net/User");
    console.log("DB Connected")
  } catch (err) {
    console.log(err);
  }
}

module.exports = DBConnect;