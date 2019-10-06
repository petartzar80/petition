const spicedPg = require("spiced-pg");

const db = spicedPg(`postgres:postgres:postgres@localhost:5432/signatures`);

module.export.getFullName = (first, last) => {
    return db.query(
        `SELECT * FROM signatures
        WHERE first = $1 AND last = $2`,
        [first, last]
    );
};

// db.query(
//     `INSERT INTO signatures (first, last)
//             VALUES (${first}, ${last})
//             RETURNING *`
// ).then(({ rows }) => console.log(rows).catch(err => console.log(err.massage)));

// db.query(`SELECT * FROM cities WHERE city = 'Berlin'`).then(({ rows }) =>
//     console.log(rows).ctch(err => console.log(err.massage))
// );
