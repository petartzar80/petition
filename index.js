const express = require("express");
const app = express();
exports.app = app;
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const {
    addInfo,
    showSignature,
    getFullName,
    getNumSigners,
    register,
    getPassword,
    addProfile,
    getCities,
    getIfSigned,
    deleteSig,
    getEditProfile,
    updateNoPswd,
    updateWithPswd,
    upsert
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
    if (req.session.regId) {
        res.redirect("/petition");
    } else {
        res.redirect("/registration");
    }
});

app.get("/registration", (req, res) => {
    res.render("registration");
});

app.post("/registration", (req, res) => {
    let firstName =
        req.body.first.charAt(0).toUpperCase() + req.body.first.slice(1);
    let lastName =
        req.body.last.charAt(0).toUpperCase() + req.body.last.slice(1);
    let email = req.body.email;
    let origPswd = req.body.password;
    let password = "";

    hash(origPswd)
        .then(result => {
            password = result;
            return password;
        })

        .then(password => {
            register(firstName, lastName, email, password)
                .then(({ rows }) => {
                    req.session.regId = rows[0].id;
                    res.redirect("/profile");
                })
                .catch(err => {
                    console.log(err);
                    res.render("registration", { error: true });
                });
        });
});

app.get("/profile", (req, res) => {
    res.render("profile");
});

app.post("/profile", (req, res) => {
    let age = req.body.age;
    let city = req.body.city.charAt(0).toUpperCase() + req.body.city.slice(1);
    let homepage = req.body.homepage;
    let userId = req.session.regId;
    if (age || city || homepage) {
        addProfile(age, city, homepage, userId).then(() => {
            res.redirect("/petition");
        });
    } else {
        res.redirect("/petition");
    }
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    let email = req.body.email;
    let id;
    let logPass = req.body.password;
    getPassword(email)
        .then(({ rows }) => {
            let receivedPass = rows[0].password;
            let receivedId = rows[0].id;
            let isMatch = compare(logPass, receivedPass);
            id = receivedId;
            return isMatch;
        })
        .then(isMatch => {
            if (isMatch) {
                getIfSigned(id)
                    .then(({ rows }) => {
                        console.log("if signed rows: ", rows[0]);
                        if (rows[0]) {
                            req.session.signedId = rows[0].sig_id;
                            req.session.regId = id;
                            res.redirect("/thanks");
                        } else if (rows[0] == undefined) {
                            req.session.regId = id;
                            res.redirect("/petition");
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        res.render("login", { error: true });
                    });
            } else {
                res.render("login", { error: true });
            }
        })
        .catch(err => {
            console.log(err);
            res.render("login", { error: true });
        });
});

app.get("/petition", (req, res) => {
    if (req.session.regId) {
        getIfSigned(req.session.regId).then(({ rows }) => {
            if (rows[0]) {
                res.redirect("/thanks");
            } else {
                res.render("petition");
            }
        });
    }
});

app.post("/petition", (req, res) => {
    let signature = req.body.signature;
    let regId = req.session.regId;
    addInfo(signature, regId)
        .then(({ rows }) => {
            req.session.signedId = rows[0].id;
            res.redirect("/thanks");
        })
        .catch(err => {
            console.log(err);
            res.render("petition", { error: true });
        });
});

app.get("/thanks", (req, res) => {
    let idCookie = req.session.regId;
    let renderingObject = {};
    showSignature(idCookie)
        .then(({ rows }) => {
            renderingObject.first = rows[0].first.toUpperCase();
            renderingObject.signature = rows[0].signature;
        })
        .then(() => {
            getNumSigners().then(({ rows }) => {
                renderingObject.count = rows[0].count;
                res.render("thanks", renderingObject);
            });
        })
        .catch(err => {
            console.log(err);
            res.render("thanks", { error: true });
        });
});

app.post("/signature/delete", (req, res) => {
    deleteSig(req.session.regId).then(() => {
        req.session.signedId = null;
        res.redirect("/petition");
    });
});

app.get("/profile/edit", (req, res) => {
    getEditProfile(req.session.regId)
        .then(({ rows }) => {
            res.render("editprofile", {
                first: rows[0].first_name,
                last: rows[0].last_name,
                email: rows[0].mail,
                age: rows[0].age_int,
                city: rows[0].residence,
                page: rows[0].url
            });
        })
        .catch(err => {
            console.log(err);
            res.render("editprofile", { error: true });
        });
});

app.post("/profile/edit", (req, res) => {
    if (!req.body.password) {
        updateNoPswd(
            req.body.first.charAt(0).toUpperCase() + req.body.first.slice(1),
            req.body.last.charAt(0).toUpperCase() + req.body.last.slice(1),
            req.body.email,
            req.session.regId
        )
            .then(() => {
                upsert(
                    req.body.age,
                    req.body.city.charAt(0).toUpperCase() +
                        req.body.city.slice(1),
                    req.body.page,
                    req.session.regId
                );
                res.redirect("/thanks");
            })
            .catch(err => {
                console.log(err);
                res.render("editprofile", { error: true });
            });
    } else {
        let origPswd = req.body.password;
        let password = "";

        hash(origPswd)
            .then(result => {
                password = result;
                return password;
            })

            .then(password => {
                updateWithPswd(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    password,
                    req.session.regId
                )
                    .then(() => {
                        upsert(
                            req.body.age,
                            req.body.city,
                            req.body.page,
                            req.session.regId
                        );
                        res.redirect("/thanks");
                    })
                    .catch(err => {
                        console.log(err);
                        res.render("editprofile", { error: true });
                    });
            });
    }
});

app.get("/signers", (req, res) => {
    getFullName()
        .then(({ rows }) => {
            console.log("signers rows: ", rows);
            res.render("signers", { rows });
        })
        .catch(err => {
            console.log(err);
            res.render("signers", { error: true });
        });
});

app.get("/signers/:city", (req, res) => {
    const { city } = req.params;
    getCities(city)
        .then(({ rows }) => {
            res.render("signers", {
                rows,
                extractedCity: true,
                town: rows[0].residence.toUpperCase()
            });
        })
        .catch(err => {
            console.log(err);
            res.render("signers", { error: true });
        });
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/registration");
});

app.listen(process.env.PORT || 8080, () =>
    console.log("Petition server running")
);
