require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const User = require("./models/User"); 

const app = express();

// Middleware

const corsOptions = {
    origin: [
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  };
  app.use(cors(corsOptions))
app.use(express.json());

// Database Connection
mongoose.connect(process.env.NEXT_PUBLIC_MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Sample Route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// ✅ User Signup Route
app.post("/users", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with empty fields for later updates
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            profilePicture: "", 
            dob: "", 
            hobbies: [] 
        });

        // Save user to DB
        await newUser.save();

        res.status(201).json({ message: "User registered successfully", user: { name, email } });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});


// ✅ GET User Data by Email
app.get("/users", async (req, res) => {
    try {
        const { email } = req.query; // Get email from query params

        if (!email) {
            return res.status(400).json({ message: "Email is required!" });
        }

        // Find user by email
        const user = await User.findOne({ email }).select("-password"); // Exclude password

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error", error });
    }
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
