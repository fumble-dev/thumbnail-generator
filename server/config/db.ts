import mongoose from "mongoose";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);

        console.log("MongoDB connected");

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err);
        });

    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

export default connectDb;
