const spicedPg = require("spiced-pg");

const db = spicedPg(`postgres:postgres:postgres@localhost:5432/petition`);

module.exports.getFullName = () => {
    return db.query(`SELECT first, last FROM signatures`);
};

module.exports.showSignature = idCookie => {
    return db.query(`SELECT first, signature FROM signatures WHERE id = $1`, [
        idCookie
    ]);
    // return db.query(
    //     `SELECT first, signature FROM signatures WHERE id = ${idCookie}`
    // );
};

module.exports.getNumSigners = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`);
};

exports.addInfo = (first, last, signature) => {
    return db.query(
        `
        INSERT INTO signatures (first, last, signature)
        VALUES ($1, $2, $3)
        RETURNING id
        `,
        [first, last, signature]
    );
};

exports.register = (first, last, email, password) => {
    return db.query(
        `
        INSERT INTO users (first, last, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [first, last, email, password]
    );
};

`SELECT signature FROM signatures WHERE id = $1`;
// for thanks db query

// db.query(
//     `INSERT INTO signatures (first, last)
//             VALUES (${first}, ${last})
//             RETURNING *`
// ).then(({ rows }) => console.log(rows).catch(err => console.log(err.massage)));

// db.query(`SELECT * FROM cities WHERE city = 'Berlin'`).then(({ rows }) =>
//     console.log(rows).ctch(err => console.log(err.massage))
// );
