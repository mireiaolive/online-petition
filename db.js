const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/geography");

module.exports.getCities = () => {
    return db.query(`SELECT * FROM cities`);
};

module.exports.addCity = (city, country) => {
    return db.query(`INSERT INTO cities (city, country)VALUES ($1, $2)`, [
        city,
        country,
    ]);
};
