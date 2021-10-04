const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");
const cookieSession = require("cookie-session");
const bcrypt = require("./bcrypt");
//const csurf = require("csurf");

if (process.env.NODE_ENV == "production") {
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"].startsWith("https")) {
            return next();
        }
        res.redirect(`https://${req.hostname}${req.url}`);
    });
}

//settings
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

//middlewares
app.use(express.urlencoded({ extended: false }));

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

//name of project directory
app.use(express.static("./public"));

//routes; get, post, put, head, delete, patch, options
//get is used to request data from a specified resource
//post is used to send data to a server to create/update a resource
app.get("/", (req, res) => {
    console.log("req.url in / route: ", req.url);
    console.log("req.method in / route: ", req.method);
    console.log("cookie session: ", req.session);
    res.redirect("/register");
});

app.get("/petition", (req, res) => {
    if (req.session.sigId) {
        return res.redirect("/thanks");
    }
    console.log("request session petition");
    res.render("petition", {
        layout: "main",
    });
});

app.post("/petition", (req, res) => {
    db.clickSubmitSignature(req.body.hiddenInput, req.session.userid)
        .then((results) => {
            req.session.sigId = results.rows[0].id;
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("err in post petition: ", err);
            res.render("petition", {
                layout: "main",
                errorMessage: "Ops! Something went wrong. Try again!",
            });
        });
});

app.get("/thanks", (req, res) => {
    if (req.session.sigId) {
        var myPromise = db
            .getSign(req.session.sigId)
            .then((result) => {
                return result.rows[0].signature;
            })
            .catch((err) => {
                console.log("err in get thanks: ", err);
            });

        var myOtherPromise = db
            .getTotal()
            .then((result) => {
                return result.rows[0].count;
            })
            .catch((err) => {
                console.log("err in post profile: ", err);
            });

        Promise.all([myPromise, myOtherPromise])
            .then((results) => {
                var sigUser = results[0];
                var numUser = results[1];
                res.render("thanks", {
                    layout: "main",
                    sigUser,
                    numUser,
                });
            })
            .catch((err) => {
                console.log("we have an error: ", err);
            });
    } else {
        res.redirect("/petition");
    }
});

app.get("/signers", (req, res) => {
    if (req.session.sigId) {
        db.getNames()
            .then((result) => {
                var signers = result.rows;
                console.log("checking for data :", signers);
                res.render("signers", {
                    layout: "main",
                    signers,
                });
            })
            .catch((err) => {
                console.log("error in get signers: ", err);
            });
    } else {
        res.redirect("/petition");
    }
});

app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main",
    });
});

app.post("/register", (req, res) => {
    bcrypt
        .hash(req.body.password)
        .then((result) => {
            db.clickSubmit(
                req.body.first,
                req.body.last,
                req.body.email,
                result
            )
                .then((result) => {
                    req.session.userid = result.rows[0].id;
                    req.session.first = req.body.first;
                    req.session.last = req.body.last;
                    res.redirect("/profile");
                })
                .catch((err) => {
                    console.log("err in click submit: ", err);
                    res.render("register", {
                        layout: "main",
                        errorMessage: "Ops! Something went wrong",
                    });
                });
        })
        .catch((err) => {
            console.log("err in hash: ", err);
        });
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
    });
});

app.post("/login", (req, res) => {
    db.getEmail(req.body.email).then((result) => {
        if (result.rows[0]) {
            bcrypt
                .compare(req.body.password, result.rows[0].hashed_password)
                .then((match) => {
                    console.log("result: ", match);
                    if (match) {
                        req.session.userid = result.rows[0].id;
                        res.redirect("/petition");
                    } else {
                        res.render("login", {
                            layout: "main",
                            errorMessage:
                                "Ops! Something went wrong, no password",
                        });
                    }
                })
                .catch((err) => {
                    console.log("we have an error here: ", err);
                    res.render("login", {
                        layout: "main",
                        errorMessage: "Ops! Something went wrong, no password",
                    });
                });
        } else {
            res.render("login", {
                layout: "main",
                errorMessage: "Ops! Something went wrong, no password",
            });
        }
    });
});

app.get("/profile", (req, res) => {
    if (!req.session.userid) {
        return res.redirect("/petition");
    }
    res.render("profile", {
        layout: "main",
    });
});

app.post("/profile", (req, res) => {
    const { age, city, homepage } = req.body;
    const userId = req.session.userid;

    db.addProfile(age, city, homepage, userId)
        .then(() => {
            res.redirect("/petition");
        })
        .catch((err) => {
            res.render("profile", {
                layout: "main",
                errorMessage: "Ops! Something went wrong",
            });
            console.log("err in post profile", err);
        });
});

// dynamic routing - think req.params
app.get("/signers/:city", (req, res) => {
    let city = req.params.city;
    console.log("req.params in /signers/:city: ", req.params.city);
    db.getCity(city)
        .then((results) => {
            console.log("see results: ", results);
            let signerCity = results.rows;
            res.render("signers", {
                layout: "main",
                signerCity,
            });
        })
        .catch((err) => {
            res.render("signerCity", {
                layout: "main",
                errorMessage: "Ops! Something went wrong",
            });
            console.log("err in post profile", err);
        });
});

app.post("/signers/:city", (req, res) => {
    res.redirect("/edit");
});

app.get("/edit", (req, res) => {
    console.log("get edit request working");
    db.getEdit(req.session.userid)
        .then((results) => {
            console.log("see the results: ", results.rows[0]);
            let data = results.rows[0];

            res.render("edit", {
                layout: "main",
                data,
            });
        })
        .catch((err) => {
            console.log("err in edit get request: ", err);
        });
});

app.post("/edit", (req, res) => {
    console.log("post to change input");
    console.log("see new input: ", req.body);
    if (req.body.password) {
        bcrypt
            .hash(req.body.password)
            .then((result) => {
                db.editPass(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    result,
                    req.session.userid
                )
                    .then((result) => {
                        console.log("see input to edit: ", result);
                        db.editProfile(
                            req.body.age,
                            req.body.city,
                            req.body.homepage,
                            req.session.userid
                        )
                            .then(() => {
                                console.log("edit finished");
                                res.redirect("/signers");
                            })
                            .catch((err) => {
                                console.log("err in edit profile:", err);
                            });
                    })
                    .catch((err) => {
                        console.log("err in edit password:", err);
                    });
            })
            .catch((err) => {
                console.log("err in hashed password: ", err);
            });
    } else {
        db.updateUser(
            req.body.first,
            req.body.last,
            req.body.email,
            req.session.userid
        ).then((result) => {
            console.log("update input: ", result);
            db.editProfile(
                req.body.age,
                req.body.city,
                req.body.homepage,
                req.session.userid
            )
                .then(() => {
                    console.log("all updated");
                    res.redirect("/signers");
                })
                .catch((err) => {
                    console.log("err in edit profile :", err);
                })
                .catch((err) => {
                    console.log("err in update profile :", err);
                });
        });
    }
});

app.post("/register", (req, res) => {
    bcrypt
        .hash(req.body.password)
        .then((result) => {
            db.clickSubmit(
                req.body.first,
                req.body.last,
                req.body.email,
                result
            )
                .then((result) => {
                    req.session.userid = result.rows[0].id;
                    req.session.first = req.body.first;
                    req.session.last = req.body.last;
                    res.redirect("/profile");
                })
                .catch((err) => {
                    console.log("err in click submit: ", err);
                    res.render("register", {
                        layout: "main",
                        errorMessage: "Ops! Something went wrong",
                    });
                });
        })
        .catch((err) => {
            console.log("err in hash: ", err);
        });
});

app.get("/delete", (req, res) => {
    res.render("delete", {
        layout: "main",
    });
});

app.post("/delete", (req, res) => {
    db.deleteProfile(req.session.userid)
        .then(() => {
            db.deleteSignature(req.session.userid).then(() => {
                db.deleteUser(req.session.userid)
                    .then(() => {
                        req.session = null;
                        console.log("we are out of session: ", req.session);
                        res.render("delete", {
                            layout: "main",
                            confirmation:
                                "You have successfully deleted your ocean account. Good luck!",
                        });
                    })
                    .catch((err) => {
                        console.log("err delete: ", err);
                    });
            });
        })
        .catch((err) => {
            console.log("err delete: ", err);
        });
});
app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});

app.listen(process.env.PORT || 8080, () =>
    console.log("petition server is listening... ")
);
