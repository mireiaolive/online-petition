const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");
const cookieSession = require("cookie-session");
const bcrypt = require("./bcrypt");

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
    res.redirect("/petition");
    //console.log("redirect to /petition working");
});

app.get("/petition", (req, res) => {
    //console.log("render petition page is working, session in userid");
    res.render("petition", {
        layout: "main",
    });
});

//POST petition
//set cookie and go to thanks, insert input to db, if err render errmessage
//update this route so that it passes user_id from the session to the INSERT for the signature
app.post("/petition", (req, res) => {
    //console.log("post request is working");
    db.clickSubmit(req.body.hiddenInput, req.body.user_id)
        .then((results) => {
            //console.log("testing1");
            req.session.sigId = results.rows[0].id; //query results
            //console.log("testing2");
            res.redirect("/petition/thanks");
        })
        .catch((err) => {
            //console.log("err in post petition: ", err);
            res.render("petition", {
                layout: "main",
                errorMessage: "Ops! Something went wrong",
            });
        });
});

//GET thanks
//render thx template, ckeck for cookie if not go to petition page
app.get("/petition/thanks", (req, res) => {
    console.log("requested session on thanks page is working");
    if (req.session.sigId) {
        //console.log("testing4");
        var myPromise = db
            .getNames(req.session.sigId)
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
app.get("/petition/signers", (req, res) => {
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

//GET signers

//GET register
//renders register
app.get("/register", (req, res) => {
    //console.log("render register page is working");
    res.render("register", {
        layout: "main",
    });
});

//POST register

//GET login
//renders login
app.get("/login", (req, res) => {
    console.log("render login page is working, request session is in login");
    res.render("login", {
        layout: "main",
    });
});

//POST login
//find the user information
//Pass the hashed password
app.post("/login", (req, res) => {
    console.log("post login working");
    console.log("req body ", req.body);
    db.getEmail(req.body.email).then((result) => {
        bcrypt
            .compare(req.body.password, results.rows[0].hashedPassword)
            .then((result) => {});
    });
});

//GET profile
app.get("/profile", (req, res) => {
    //console.log("render profile page is working");
    res.render("profile");
});

//POST profile
app.post("/profile", (req, res) => {
    //console.log("age, city, homepage");
    const { age, city, homepage } = req.body;
    const userId = req.session.id;

    db.addProfile(age, city, homepage, userId)
        .then(() => {
            res.redirect("/petition");
        })
        .catch((err) => {
            //console.log("err in post profile: ", err);
            res.render("profile", {
                layout: "main",
                errorMessage: "Ops! Something went wrong",
            });
        });
});
app.listen(8080, () => console.log("petition server is listening... "));
