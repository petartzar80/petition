const express = require("express");
const app = express();
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const { addInfo, showSignature, getFullName } = require("./db");
const csurf = require("csurf");

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

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

app.use(csurf());

app.use(express.static("./public"));

// against clickjacking
app.use((req, res, next) => {
    res.set("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.get("/", (req, res) => {
    console.log("req session in route ", req.session);
    res.redirect("/petition");
});
app.get("/petition", (req, res) => {
    res.render("petition");
});

app.post("/petition", (req, res) => {
    let firstName = req.body.first;
    let lastName = req.body.last;
    let signature = req.body.signature;
    console.log(firstName);
    console.log(lastName);
    console.log(signature);
    addInfo(firstName, lastName, signature)
        .then(({ rows }) => {
            console.log("rows: ", rows);
            req.session.userId = rows[0].id;
            res.redirect("/thanks");
        })
        .catch(err => {
            console.log(err);
            res.render("petition", { error: true });
        });
});

app.get("/thanks", (req, res) => {
    let idCookie = req.session.userId;
    console.log("ID cookie: ", idCookie);
    showSignature(idCookie).then(({ rows }) => {
        console.log("THANKS ROWS first: ", rows[0].first);
        // res.render("thanks");
        res.render("thanks", {
            first: rows[0].first,
            signature: rows[0].signature
        });
    });
});

app.get("/signers", (req, res) => {
    getFullName().then(({ rows }) => {
        res.render("signers", { rows });
    });
});

// app.get("/test", (req, res) => {
//     req.session.sigId = 10;
//     console.log("req. session in test: ", req.session);
//     res.redirect("/");
// });
//
// app.get("*", (req, res) => {
//     req.session.cohort = "coriander";
//     res.redirect("/");
// });

app.get("/logout", (req, res) => {
    req.session = null;
    // deleting a single cookie
    // req.session.digId = null
});

app.listen(8080, () => console.log("Petition server running"));
