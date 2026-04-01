const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    try {
        let dbUrl = process.env.MONGO_URI;

        if (!dbUrl || dbUrl.includes('localhost')) {
            console.log("Starting In-Memory MongoDB for demo...");
            const mongoServer = await MongoMemoryServer.create();
            dbUrl = mongoServer.getUri();
        }

        await mongoose.connect(dbUrl);
        console.log("MongoDB Connected Successfully at", dbUrl);
    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;