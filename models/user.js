const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: [true, "Debes introducir un nombre de usuario"],
        unique: true
    },
    password: {
        type: String,
        require: [true, "Debes introducir una contraseña"]
    }
})

module.exports = mongoose.model("User", userSchema);