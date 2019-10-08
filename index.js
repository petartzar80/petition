const express = require("express");
const app = express();
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const {
    addInfo,
    showSignature,
    getFullName,
    getNumSigners,
    register,
    getPassword
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
    res.redirect("/registration");
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

    hash(origPswd)
        .then(result => {
            password = result;
            return password;
        })

        .then(password => {
            console.log("testing ", password);
            register(firstName, lastName, email, password)
                .then(({ rows }) => {
                    req.session.regId = rows[0].id;
                    res.redirect("/petition");
                })
                .catch(err => {
                    console.log(err);
                    res.render("registration", { error: true });
                });
        });
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    let email = req.body.email;
    // let logPass = "";
    let id;
    let logPass = req.body.password;
    getPassword(email)
        .then(({ rows }) => {
            let receivedPass = rows[0].password;
            let receivedId = rows[0].id;
            console.log("Top received ID: ", receivedId);
            console.log("receivedPass: ", receivedPass);
            let isMatch = compare(logPass, receivedPass);
            id = receivedId;
            // let returnArray = [isMatch, receivedId];
            // return returnArray;
            return isMatch;
        })
        .then(isMatch => {
            if (isMatch) {
                console.log("New cookie: ", id);
                req.session.regId = id;
                res.redirect("/petition");
            } else {
                res.render("login", { error: true });
            }
        })
        .catch(err => {
            console.log(err);
            res.render("login", { error: true });
        });
    // console.log("Is Match: ", isMatch));
    // hash(req.body.password)
    //     .then(result => {
    //         logPass = result;
    //         console.log("logPass hashed: ", logPass);
    //         return logPass;
    //     })
    //     .then(logPass => {
    //         getPassword(email)
    //             .then(({ rows }) => {
    //                 let receivedPass = rows[0].password;
    //                 console.log("receivedPass: ", receivedPass);
    //                 return compare(logPass, receivedPass);
    //             })
    //             .then(isMatch => console.log("Is Match: ", isMatch));
    //     });
});

app.get("/petition", (req, res) => {
    res.render("petition");
});

app.post("/petition", (req, res) => {
    let firstName = req.body.first;
    let lastName = req.body.last;
    let signature = req.body.signature;
    let userId = req.session.regId;
    // console.log(firstName);
    // console.log(lastName);
    // console.log(signature);
    addInfo(firstName, lastName, signature, userId)
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
        )
        .catch(err => {
            console.log(err);
            res.render("thanks", { error: true });
        });
});

app.get("/signers", (req, res) => {
    getFullName()
        .then(({ rows }) => {
            res.render("signers", { rows });
        })
        .catch(err => {
            console.log(err);
            res.render("signers", { error: true });
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
