const express = require("express");
const app = express();
const hb = require("express-handlebars");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: false
    })
);

//MIDDLEWARE

app.use((req, res, next) => {
    console.log("middleware running");
    console.log("req.url: ", req.url);
    next();
});

app.use(express.static("./public"));

app.get("/", (req, res) => {
    res.render("petition");
});

app.post("/petition", (req, res) => {
    res.redirect("thanks");
});

app.get("/thanks", (req, res) => {
    res.render("thanks");
});

app.get("/signers", (req, res) => {
    res.render("signers");
});

app.listen(8080, () => console.log("Petition server running"));
