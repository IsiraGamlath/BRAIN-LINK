
//h1vG6BK4PpmeQbEl


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const sessionRoutes = require('./routes/SessionRoutes');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

app.use('/sessions', sessionRoutes);

// MongoDB Connection
mongoose.connect("mongodb://admin:h1vG6BK4PpmeQbEl@ac-p0umdby-shard-00-00.1hh0nlu.mongodb.net:27017,ac-p0umdby-shard-00-01.1hh0nlu.mongodb.net:27017,ac-p0umdby-shard-00-02.1hh0nlu.mongodb.net:27017/brainlink?ssl=true&authSource=admin&replicaSet=atlas-qe3hdm-shard-0&retryWrites=true&w=majority")
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(5000, () => {
            console.log("Server running on port 5000");
        });
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB:", err.message);
        process.exit(1);
    });