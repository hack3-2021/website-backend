const express = require('express')
var mysql = require('mysql')
const util = require('util');
require('dotenv').config()
const app = express()
const port = 3000

var connection = mysql.createConnection({
  host: process.env.DB_IP,
  user: 'hack3',
  password: process.env.DB_PASS,
  database: 'hack3',
  typeCast: function castField( field, useDefaultTypeCasting ) {

		// We only want to cast bit fields that have a single-bit in them. If the field
		// has more than one bit, then we cannot assume it is supposed to be a Boolean.
		if ( ( field.type === "BIT" ) && ( field.length === 1 ) ) {

			var bytes = field.buffer();

			// A Buffer in Node represents a collection of 8-bit unsigned integers.
			// Therefore, our single "bit field" comes back as the bits '0000 0001',
			// which is equivalent to the number 1.
			return( bytes[ 0 ] === 1 );

		}

		return( useDefaultTypeCasting() );

	}
})

connection.connect()

runQuery = (query) => {
	return new Promise((resolve, reject) => {
		connection.query(query, (err, rows) => {
			if (err) {
				return reject(error);
			}
			return resolve(rows);
		})
	})
}

app.get('/api/profile', async (req, res) => {
  email = req.query.email;
  const rows = await runQuery('SELECT * FROM users WHERE email=' + connection.escape(email) + ';')
  if (rows.length == 0) {
  	res.sendStatus(404);
  	return;
  }
  console.log(rows);
  let row = rows[0];
  let communityID = row.communityID;
  const suburbResponse = await runQuery('SELECT suburb FROM communities WHERE communityID=' + communityID + ';');
  let suburb = suburbResponse[0].suburb;
  
  response = {
  	"email": row.email,
  	"firstName": row.firstName,
  	"lastName": row.lastName,
  	"picture": row.picture,
  	"bio": row.bio,
  	"phoneNumber": row.phoneNumber,
  	"vaccinated": row.vaccinated,
  	"suburb": suburb
  }
  res.send(JSON.stringify(response));
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
