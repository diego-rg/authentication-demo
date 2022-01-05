const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Debes introducir un nombre de usuario"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Debes introducir una contraseña"]
    }
})

module.exports = mongoose.model("User", userSchema);