const mongoose = require("mongoose");

let isConnected = false;

const DBConnect = async () => {
  if (isConnected) {
    return;
  }
  try {
    const db = await mongoose.connect("mongodb+srv://bhaveshpandey:webdevproject@cluster0.wz63xid.mongodb.net/User");
    isConnected = db.connections[0].readyState === 1;
    console.log("DB Connected");
  } catch (err) {
    console.log("MongoDB Connection Error: ", err);
    throw err;
  }
};

module.exports = DBConnect;