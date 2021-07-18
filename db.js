var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:spicedling:password@localhost:5432/postgres");

module.exports.clickSubmit = (first, last, signature) => {
    return db.query(
        `INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3) RETURNING id`,
        [first, last, signature]
    );
};

module.exports.getSign = (id) => {
    return db.query(`SELECT * FROM signatures WHERE id = ${id}`);
};

module.exports.getTotal = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`);
};

module.exports.getNames = () => {
    return db.query(`SELECT firstname, lastname FROM signatures`);
};
