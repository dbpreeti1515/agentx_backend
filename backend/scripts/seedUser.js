require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/userModel");
const { connectDB } = require("../src/db/connect");

const seedUser = async () => {
  try {
    await connectDB();

    const userData = {
      email: "db.sales@agentx.com",
      password: "Sales@123",
      role: "sales",
    };

    const existingUser = await User.findOne({ email: userData.email });

    if (existingUser) {
      console.log("User already exists. Updating password...");
      existingUser.password = userData.password;
      await existingUser.save();
      console.log("User updated successfully!");
    } else {
      await User.create(userData);
      console.log("User created successfully!");
    }

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding user:", error);
    process.exit(1);
  }
};

seedUser();
