const express = require('express')
var mysql = require('mysql')
require('dotenv').config()
const app = express()
const port = 3000

console.log(process.env.DB_PASS)

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'hack3',
  password: process.env.DB_PASS,
  database: 'hack3'
})

connection.connect()

connection.query('QUERY', function (err, rows, fields) {
  if (err) throw err

  console.log('The solution is: ', rows[0].solution)
})


app.get('/api/profile', (req, res) => {
  email = req.query.email;
  res.send('email: ' + email)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})