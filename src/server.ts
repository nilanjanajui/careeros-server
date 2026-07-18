import express = require("express");
import dotenv = require("dotenv");
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import session from "express-session";
import passport from "./config/passport";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use(session({ secret: process.env.SESSION_SECRET!, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));