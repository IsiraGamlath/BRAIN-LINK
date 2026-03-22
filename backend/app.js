
//h1vG6BK4PpmeQbEl


const express = require('express');
const mongoose = require('mongoose');

const app = express();

//Middleware
app.use("/",(req, res, next) => {
    res.send("It is working");
});


mongoose.connect("mongodb+srv://admin:h1vG6BK4PpmeQbEl@cluster0.1hh0nlu.mongodb.net/")
.then(() => console.log("Connected to MongoDB"))
.then(() => {
    app.listen(5000);
})
.catch((err) => console.log((err)));