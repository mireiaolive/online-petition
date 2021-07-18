const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");
var cookieSession = require("cookie-session");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: false }));

app.use(express.static("./public"));

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

//GET petition
//render petition template, goes to thanks page if user signed.
//SigId is the route session
app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    if (req.session.sigId) {
        res.redirect("/petition/thanks");
    } else {
        res.render("petition", {
            layout: "main",
        });
    }
});

//POST petition
//runs when user signs, inserts data to the database, if error render errormeesage, if not go to thanks page
app.post("/petition", (req, res) => {
    db.getNames(req.body.first, req.body.last, req.body.hiddenInput)
        .then((val) => {
            req.session.sigId = val.rows[0].id;
            res.redirect("/petition/thanks");
        })
        .catch((err) => {
            res.render("petition", {
                layout: "main",
                errmessage,
            });
        });
});

//GET thanks
//render thanks template, redirect petition
app.get("/petition/thanks", (req, res) => {
    if (req.session.sigId) {
        var myPromise = db
            .getSign(req.session.sigId)
            .then((val) => {
                return val.rows[0].signature;
            })
            .catch((error) => {
                console.log("err in/data: ", err);
            });

        var myOtherPromise = db
            .getTotal()
            .then((val) => {
                return val.rows[0].count;
            })
            .catch((error) => {
                console.log("err in/data: ", err);
            });

        //pass an array of promises  that returns a new promise resolved when others resolved
        Promise.all([myPromise, myOtherPromise])
            .then((val) => {
                var signature = val[0];
                var number = val[1];
                res.render("thanks", {
                    layout: "main",
                    signature,
                    number,
                });
            })
            .catch((error) => {
                console.log("At least one of my promises was rejected");
            });
    } else {
        res.redirect("/petition");
    }
});

//GET signers
//render signers template, redirect petition, list signers from database
app.get("/petition/signers", (req, res) => {
    if (req.session.sigId) {
        db.getNames()
            .then((val) => {
                var data = val.rows;
                res.render("signers", {
                    layout: "main",
                    data,
                });
            })
            .catch((error) => {
                console.log("err in/data: ", err);
            });
    } else {
        res.redirect("/petition");
    }
});

app.listen(8080, () => console.log("petition server is listening... "));
