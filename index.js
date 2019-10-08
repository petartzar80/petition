const express = require("express");
const app = express();
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const {
    addInfo,
    showSignature,
    getFullName,
    getNumSigners,
    register
} = require("./db");
const csurf = require("csurf");
const { hash, compare } = require("./passwordModules");

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

// app.use(csurf());

app.use(express.static("./public"));

// against clickjacking
// app.use((req, res, next) => {
//     res.set("x-frame-options", "DENY");
//     res.locals.csrfToken = req.csrfToken();
//     next();
// });

app.get("/", (req, res) => {
    console.log("req session in route ", req.session);
    res.redirect("/petition");
});

app.get("/registration", (req, res) => {
    res.render("registration");
});

app.post("/registration", (req, res) => {
    let firstName = req.body.first;
    let lastName = req.body.last;
    let email = req.body.email;
    let origPswd = req.body.password;
    let password = "";
    // console.log(firstName);
    // console.log(lastName);
    // console.log(email);
    hash(origPswd)
        .then(result => {
            console.log("Hash result: ", result);
            password = result;
            return password;
        })
        .then(password => {
            console.log("Hashed password: ", password);
        })
        .then(
            register(firstName, lastName, email, password).then(({ rows }) => {
                console.log("testing password: ", password);
                console.log("register rows: ", rows);
                console.log("returned password: ", rows[0].password);
            })
        );
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/petition", (req, res) => {
    res.render("petition");
});

app.post("/petition", (req, res) => {
    let firstName = req.body.first;
    let lastName = req.body.last;
    let signature = req.body.signature;
    // console.log(firstName);
    // console.log(lastName);
    // console.log(signature);
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
    let renderingObject = {};
    console.log("ID cookie: ", idCookie);
    showSignature(idCookie)
        .then(({ rows }) => {
            console.log("THANKS ROWS first: ", rows[0].first);
            renderingObject.first = rows[0].first;
            renderingObject.signature = rows[0].signature;
            // res.render("thanks");
            // res.render("thanks", {
            //     first: rows[0].first,
            //     signature: rows[0].signature
            // });
        })
        .then(
            getNumSigners().then(({ rows }) => {
                console.log("getnum rows: ", rows[0].count);
                renderingObject.count = rows[0].count;
                console.log("rend object: ", renderingObject);
                res.render("thanks", renderingObject);
            })
        );
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
