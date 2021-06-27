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
  const rows = await connection.query('SELECT * FROM users WHERE email=' + connection.escape(email))
  console.log(rows)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})