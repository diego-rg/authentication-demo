const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const bcrypt = require("bcrypt");
const session = require("express-session");

const requireLogin = (req, res, next) => {//Middleware para login
    if (!req.session.user_id) {
        return res.redirect("/login");
    }
    next();
}

const User = require("./models/user");

mongoose.connect('mongodb://localhost:27017/authDemo', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!")
    })
    .catch(err => {
        console.log("MONGO CONNECTION ERROR!")
        console.log(err)
    })


app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));//Para usar req.body (objeto cos datos da form)
app.use(session({ secret: "notagoodsecret", resave: false, saveUninitialized: false }));  

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("home");
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
    const testHashed = await bcrypt.hash(req.body.password, 12);
    const tryLogin = await bcrypt.compare(req.body.password, user.password);
    if(tryLogin) {
        req.session.user_id = user._id;
        res.redirect("/userArea");
    } else {
        res.redirect("login");
    }
})

app.post("/logout", (req, res) => {
    //req.session.user_id = null;//Valería neste caso con solo esta, xa que non hai máis que cerrar sesión
    req.session.destroy();
    res.redirect("/login");
})

app.get("/userArea", requireLogin, (req, res) => {
    // if (!req.session.user_id) {
    //     return res.redirect("/login");//Cambiamos por un middleware
    // }
    res.render("userArea");
})

app.get("/supersecret", requireLogin, (req, res) => {//O login redirixe a secret, pero despois de logeado podes ir a supersecret (ruta para comprobar login noutra páxina)
    res.send("Super secret!");
})

app.listen(3000, () => {
    console.log("Listening on port 3000!");
})