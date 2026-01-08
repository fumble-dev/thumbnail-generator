import { Request,Response } from "express";
import User from "../models/user.js";
import bcrypt from 'bcrypt'

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                message: "Password too short" 
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        req.session.isLoggedIn = true;
        req.session.userId = newUser._id.toString();

        return res.status(201).json({
            message: "Account created successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
        });
    } catch (error: any) {
        console.error("Register error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        req.session.isLoggedIn = true;
        req.session.userId = user._id.toString();

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const logoutUser = async (req: Request, res: Response) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error("Logout error:", err);
                return res.status(500).json({
                    message: "Failed to logout",
                });
            }

            return res.status(200).json({
                message: "Logout successful",
            });
        });
    } catch (error) {
        console.error("Logout exception:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const verifyUser = async (req: Request, res: Response) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Not authenticated",
            });
        }

        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(401).json({
                message: "Invalid session",
            });
        }

        return res.status(200).json({
            user,
        });
    } catch (error) {
        console.error("Verify user error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};