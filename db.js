var spicedPg = require("spiced-pg");
var db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/petition"
);

//to add rows to a table, with the name of the table, and columns you insert and values
module.exports.clickSubmit = (first, last, email, hashedpassword) => {
    return db.query(
        `INSERT INTO users (first, last, email, hashed_password) VALUES ($1, $2, $3, $4) RETURNING id`,
        [first, last, email, hashedpassword]
    );
};

module.exports.clickSubmitSignature = (signature, userId) => {
    return db.query(
        `INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING id`,
        [signature, userId]
    );
};

//we use where to get more specific with the search
module.exports.getSign = (id) => {
    return db.query(`SELECT * FROM signatures WHERE id = ${id}`);
};

//count returns the number of rows in a specified table, and it preserves duplicate rows
module.exports.getTotal = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`);
};

module.exports.getNames = () => {
    return db.query(`SELECT first, last FROM users`);
};

//we use where to get more specific with the search
module.exports.getEmail = (email) => {
    return db.query(`SELECT * FROM users WHERE email = '${email}'`);
};

//to add rows to a table, with the name of the table, and columns you insert and values
module.exports.addProfile = (age, city, homepage, userId) => {
    return db.query(
        `INSERT INTO profiles (user_id, age, city, homepage) values ($1, $2, $3, $4)`,
        [userId, age, city, homepage]
    );
};
