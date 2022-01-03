const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");

const User = require("./models/user");

mongoose.connect('mongodb://localhost:27017/authDemo', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!")
    })
    .catch(err => {
        console.log("MONGO CONNECTION ERROR!")
        console.log(err)
    })

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: true }));//Para usar req.body (objeto cos datos da form)
app.use(session({ secret: "notaGoodSecret" }));   


app.get("/", (req, res) => {
    res.send("Home Page");
})

app.get("/register", (req, res) => {
    res.render("register");
})

app.post("/register", async (req, res) => {
    const hash = await bcrypt.hash(req.body.password, 12);//Pasa contraseña e o salt de bcrypto, que suele usarse 12
    const user = new User({
        username: req.body.username,
        password: hash
    })
    await user.save();
    req.session.user_id = user._id;
    res.redirect("/");
})

app.get("/login", (req, res) => {
    res.render("login");
})

app.post("/login", async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    const tryLogin = await bcrypt.compare(req.body.password, user.password);
    const testHashed = await bcrypt.hash(req.body.password, 12);
    if(tryLogin) {
        req.session.user_id = user._id;
        res.redirect("/secret");
    } else {
        res.redirect("login");
    }
})

app.post("/logout", (req, res) => {
    //req.session.user_id = null;//Valería neste caso con solo esta, xa que non hai máis que cerrar sesión
    req.session.destroy();
    res.redirect("/login");
})

app.get("/secret", (req, res) => {
    if (!req.session.user_id) {
        return res.redirect("/login");
    }
    res.render("secret");
})

app.listen(3000, () => {
    console.log("Listening on port 3000!");
})