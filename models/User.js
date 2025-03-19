const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "" }, // Empty by default
    dob: { type: String, default: "" }, // Empty by default
    hobbies: { type: [String], default: [] } // Empty array by default
});

// ✅ Create and export the User model
const User = mongoose.model("User", userSchema);
module.exports = User;
