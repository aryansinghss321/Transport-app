// server/scripts/make-admin.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");

async function run() {
  const email = process.argv[2];
  if (!email) {
    console.log("Usage: node scripts/make-admin.js <email>");
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("MongoDB connected");

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: "admin" },
    { new: true }
  );

  if (!user) {
    console.log("User not found:", email);
    process.exit(1);
  }

  console.log("Updated user to admin:", {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  });

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});