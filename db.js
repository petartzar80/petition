const spicedPg = require("spiced-pg");

const db = spicedPg(`postgres:postgres:postgres@localhost:5432/petition`);

// module.export.getFullName = (first, last) => {
//     return db.query(
//         `SELECT * FROM signatures
//         WHERE first = $1 AND last = $2`,
//         [first, last]
//     );
// };

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
