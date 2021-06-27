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
  database: 'hack3'
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
