const express = require('express')
var mysql = require('mysql')
require('dotenv').config()
const app = express()
const port = 3000

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'hack3',
  password: process.env.DB_PASS,
  database: 'hack3'
})

connection.connect()

app.get('/api/profile', async (req, res) => {
  email = req.query.email;
  const rows = await connection.query('SELECT * FROM users WHERE email=' + connection.escape(email) + ';')
  if (rows.length == 0) {
  	res.sendStatus(404);
  	return;
  }
  let row = rows[0];
  let communityID = row.communityID;
  const suburbResponse = await connection.query('SELECT suburb FROM communities WHERE communityID=' + connection.escape(communityID) + ';')
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
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})