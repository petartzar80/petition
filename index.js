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
    if (req.session.regId) {
        res.redirect("/petition");
    } else {
        res.redirect("/registration");
    }
    // query if signed, redirect to thanks
    // if logged redirect to petition
    // else redirect to registration
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
    let city = req.body.city;
    let homepage = req.body.homepage;
    let userId = req.session.regId;
    console.log("age: ", age, ", city: ", city, ", homepage: ", homepage);
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
                req.session.regId = id;
                // req.session.signedId = id;
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
    let regId = req.session.signedId;
    getIfSigned(regId).then(({ rows }) => {
        if (rows[0]) {
            console.log(rows);
            res.redirect("/thanks");
        } else {
            console.log("havent signed!");
            res.render("petition");
        }
    });
    // res.render("petition");
});

app.post("/petition", (req, res) => {
    // let firstName = req.body.first;
    // let lastName = req.body.last;
    let signature = req.body.signature;
    console.log("petition sig: ", signature);
    let regId = req.session.regId;

    // console.log(firstName);
    // console.log(lastName);
    // console.log(signature);
    addInfo(signature, regId)
        .then(({ rows }) => {
            console.log("rows: ", rows);
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
    console.log("ID cookie: ", idCookie);
    showSignature(idCookie)
        .then(({ rows }) => {
            console.log("thanks rows: ", rows);
            // console.log("THANKS ROWS first: ", rows[0].first);
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

app.post("/signature/delete", (req, res) => {
    console.log("deletefirst");
    deleteSig(req.session.regId).then(() => {
        console.log("deletesecond");
        res.redirect("/registration");
    });
});

app.get("/profile/edit", (req, res) => {
    getEditProfile(req.session.regId)
        .then(({ rows }) => {
            console.log("editprofile rows: ", rows);
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
    console.log("edit post first: ", req.body.first);
    if (!req.body.password) {
        console.log("no password");
        console.log(
            "no pswd elements: ",
            req.body.first,
            req.body.last,
            req.body.email,
            req.session.regId
        );
        updateNoPswd(
            req.body.first,
            req.body.last,
            req.body.email,
            req.session.regId
        )
            .then(() => {
                console.log("I got here woohoo!");
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
    } else {
        console.log("yes password");
        let origPswd = req.body.password;
        let password = "";

        hash(origPswd)
            .then(result => {
                password = result;
                return password;
            })

            .then(password => {
                console.log("testing ", password);
                updateWithPswd(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    password,
                    req.session.regId
                )
                    .then(() => {
                        console.log("I got here woohoo!");
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
            // sigCityRows.rows[0].extractedCity = true;
            // let town = sigCityRows.rows[0].residence;
            console.log("signers city rows: ", rows);
            console.log("sigcity first_name: ", rows[0].first_name);
            // sigCityRows[0].town = true;
            res.render("signers", {
                rows,
                extractedCity: true,
                town: rows[0].residence
            });
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

app.listen(process.env.PORT || 8080, () =>
    console.log("Petition server running")
);
