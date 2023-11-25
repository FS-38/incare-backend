const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    fullname: String,
    email: String,
    no_hp: String,
    password: String,
    mood: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "hasilQuiz"
    }
})

const User = mongoose.model("User", userSchema)

module.exports = User