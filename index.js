require("dotenv").config();
const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const bcrypt = require("bcrypt");
const morgan = require("morgan");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev")); // Logging middleware

// 🔹 Global DB Variable (Initialized Later)
let db;

// ✅ Connect to MongoDB Once
async function connectDB() {
    try {
        const client = new MongoClient(process.env.NEXT_PUBLIC_MONGO_URI);
        //await client.connect();
        db = client.db("talecraft"); // Assign DB globally
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        //process.exit(1);
    }
}

// 📌 Call connectDB() when the server starts
connectDB();

// ✅ Sample Route (Basic)
app.get("/", (req, res) => {
    res.send("API is running...");
});

// ✅ User Signup Route
app.post("/users", async (req, res) => {
    try {
        if (!db) return res.status(500).json({ message: "Database not connected!" });

        const { name, email, password } = req.body;
        const usersCollection = db.collection("users");

        // Check if user exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { name, email, password: hashedPassword, profilePicture: "", dob: "", hobbies: [] };

        await usersCollection.insertOne(newUser);
        res.status(201).json({ message: "User registered successfully", user: { name, email } });
    } catch (error) {
        console.error("❌ Signup Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

// ✅ GET User Data by Email
app.get("/users", async (req, res) => {
    try {
        if (!db) return res.status(500).json({ message: "Database not connected!" });

        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ message: "Email is required!" });
        }

        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({ email }, { projection: { password: 0 } });

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("❌ Fetch User Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
