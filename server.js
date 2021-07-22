const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");
const cookieSession = require("cookie-session");
const bcrypt = require("./bcrypt");
const csurf = require("csurf");

if (process.env.NODE_ENV == "production") {
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"].startsWith("https")) {
            return next();
        }
        res.redirect(`https://${req.hostname}${req.url}`);
    });
}

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: false }));

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

app.use(express.static("./public"));

//GET petition
app.get("/", (req, res) => {
    res.redirect("/register");
    //console.log("redirect to /petition working");
});

app.get("/petition", (req, res) => {
    //console.log("render petition page is working, session in userid");
    if (req.session.sigId) {
        return res.redirect("/thanks");
    }
    console.log("request session petition");
    res.render("petition", {
        layout: "main",
    });
});

//POST petition
//set cookie and go to thanks, insert input to db, if err render errmessage
app.post("/petition", (req, res) => {
    //console.log("post request is working");
    //update this route so that it passes user_id from the session to the INSERT for the signature
    db.clickSubmit(req.body.hiddenInput, req.session.userid)
        .then((results) => {
            //console.log("testing1");
            req.session.sigId = results.rows[0].id;
            //console.log("testing2");
            res.redirect("/thanks");
        })
        .catch((err) => {
            //console.log("err in post petition: ", err);
            res.render("petition", {
                layout: "main",
                errorMessage: "Ops! Something went wrong. Try again!",
            });
        });
});

//GET thanks
//render thx template, ckeck for cookie if not go to petition page
app.get("/thanks", (req, res) => {
    console.log("requested session on thanks page is working");
    if (req.session.sigId) {
        //console.log("testing4");
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

        //pass an array of promises that returns
        //a new promise resolved when others resolved
        Promise.all([myPromise, myOtherPromise])
            .then((results) => {
                //we render query results
                var sigUser = results[0];
                var numUser = results[1];
                res.render("thanks", {
                    layout: "main",
                    sigUser,
                    numUser,
                });
            })
            .catch((err) => {
                console.log("At least one of my promises was rejected");
            });
    } else {
        //go to petition
        res.redirect("/petition");
    }
});

//GET signers
//render signers template, redirect petition, list signers from database and pass to the template
app.get("/signers", (req, res) => {
    if (req.session.sigId) {
        db.getNames()
            .then((result) => {
                console.log("Here the signers");
                //pass data to render
                var data = result.rows;
                res.render("signers", {
                    layout: "main",
                    data,
                });
            })
            .catch((err) => {
                console.log("error in signers session request ", error);
            });
    } else {
        res.redirect("/petition");
    }
});

//GET register
app.get("/register", (req, res) => {
    //console.log("render register page is working");
    res.render("register", {
        layout: "main",
    });
});

//POST register
app.post("/register", (req, res) => {
    console.log("post request is working");
    //hash the password in req.body
    bcrypt
        .hash(req.body.password)
        .then((result) => {
            //console.log("testing5");
            db.clickSubmit(
                req.body.first,
                req.body.last,
                req.body.email,
                result
            ) //put the user's id in the session, also first, last
                //that log the user in
                .then((result) => {
                    req.session.userid = result.rows[0].id;
                    req.session.first = req.body.first;
                    req.session.last = req.body.last;
                    //console.log("after registration");
                    res.redirect("/profile");
                })
                .catch((err) => {
                    console.log("error in click submit: ", err);
                    res.render("register", {
                        layout: "main",
                        errorMessage: "Ops! Something went wrong",
                    });
                });
        })
        .catch((err) => {
            console.log("error in hash: ", err);
        });
});

//GET login
app.get("/login", (req, res) => {
    console.log("render login page is working, request session is in login");
    res.render("login", {
        layout: "main",
    });
});

//POST login
app.post("/login", (req, res) => {
    console.log("post login working");
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

//GET profile
app.get("/profile", (req, res) => {
    //console.log("render profile page is working");
    if (!req.session.userid) {
        return res.redirect("/petition");
    }
    res.render("profile", {
        layout: "main",
    });
});

//POST profile
app.post("/profile", (req, res) => {
    console.log("age, city, homepage");
    const { age, city, homepage } = req.body;
    const userId = req.session.id;

    db.addProfile(age, city, homepage, userId)
        .then(() => {
            console.log("here we go to petition");
            res.redirect("/petition");
        })
        .catch((err) => {
            //console.log("err in post profile: ", err);
            res.render("profile", {
                layout: "main",
                errorMessage: "Ops! Something went wrong",
            });
            console.log("erro in post profile", err);
        });
});

//GET logout
app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});

app.listen(process.env.PORT || 8080, () =>
    console.log("petition server is listening... ")
);
