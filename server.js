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
				return reject(err);
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

app.get('/api/profile/picture', async (req, res) => {
  email = req.query.email;
  const rows = await runQuery('SELECT * FROM users WHERE email=' + connection.escape(email) + ';')
  if (rows.length == 0) {
  	res.sendStatus(404);
  	return;
  }
  console.log(rows);
  let row = rows[0];

  res.send(row.picture);
})

app.get('/api/community', async (req, res) => {
  community = req.query.community;
  const communityRows = await runQuery('SELECT * FROM communities WHERE suburb=' + connection.escape(community) + ';');
  if (communityRows.length == 0) {
	res.sendStatus(404);
	return;
  }
  let communityID = communityRows[0].communityID;
  const postRows = await runQuery('SELECT * FROM posts WHERE communityID=' + communityID + ' ORDER BY posted ASC;');
  console.log(postRows);
  let posts = [];
  for (const postRow of postRows) {
  	let userID = postRow.userID;
  	const userRow = (await runQuery('SELECT * FROM users WHERE userID=' + userID + ';'))[0];
  	console.log(userRow)
  	const commentRows = await runQuery('SELECT * FROM comments WHERE postID=' + postRow.postID + ' ORDER BY posted ASC;');
  	let comments = [];
  	for (const comment of commentRows) {
  	  const commentUser = (await runQuery('SELECT * FROM users WHERE userID=' + comment.userID + ";"))[0];
  	  comments.push({
  	  	"poster": {
  	      "email": commentUser.email,
  		  "firstName": commentUser.firstName,
  		  "lastName": commentUser.lastName,
  		  "picture": commentUser.picture,
  		  "bio": commentUser.bio,
  		  "phoneNumber": commentUser.phoneNumber,
  		  "vaccinated": commentUser.vaccinated
  	  	},
  	  	"msg": comment.contents,
  	  	"posted": comment.posted
  	  });
  	}
  	posts.push({
  	  "poster": {
  	  	"email": userRow.email,
  		"firstName": userRow.firstName,
  		"lastName": userRow.lastName,
  		"picture": userRow.picture,
  		"bio": userRow.bio,
  		"phoneNumber": userRow.phoneNumber,
  		"vaccinated": userRow.vaccinated
  	  },
  	  "msg": postRow.contents,
  	  "posted": postRow.posted,
  	  "comments": comments,
  	  "postID": postRow.postID
  	});
  }

  res.send(JSON.stringify(posts));
});

app.get('/api/post', async (req, res) => {
  let community = req.query.community;
  let email = req.query.email;
  let msg = req.query.msg;
  const userID = (await runQuery('SELECT * FROM users WHERE email=' + connection.escape(email) + ';'))[0].userID;
  const communityID = (await runQuery('SELECT communityID FROM communities WHERE suburb=' + connection.escape(community) + ';'))[0].communityID;

  runQuery('' +
  'INSERT INTO posts (userID, communityID, contents, posted) ' + 
  'VALUES (' + userID + ',' + communityID + ',' + connection.escape(msg) + ', NOW()' + ');'
  ).then(response => {
  	res.sendStatus(200);
  }, error => {
    console.log(error);
  	res.sendStatus(500);
  });
});

app.get('/api/comment', async (req, res) => {
  let postID = req.query.postID;
  let email = req.query.email;
  let msg = req.query.msg;
  const userID = (await runQuery('SELECT * FROM users WHERE email=' + connection.escape(email) + ';'))[0].userID;

  runQuery('' +
  'INSERT INTO comments (postID, userID, contents, posted) ' +
  'VALUES (' + postID + ',' + userID + ',' + connection.escape(msg) + ', NOW())'
  ).then(response => {
  	res.sendStatus(200);
  }, error => {
    console.log(error);
  	res.sendStatus(500);
  });
});

app.get('/api/create_user', async (req, res) => {
  let email = req.query.email;
  let firstName = req.query.firstName;
  let lastName = req.query.lastName;
  let pictureLink = req.query.pictureLink;
  let bio = req.query.bio;
  let phoneNumber = req.query.phoneNumber;
  let vaccinated = req.query.vaccinated;
  let community = req.query.community;
  const communityID = (await runQuery('SELECT communityID FROM communities WHERE suburb=' + connection.escape(community) + ';'))[0].communityID;
  
  runQuery('' +
  'INSERT INTO users (email, firstName, lastName, picture, bio, phoneNumber, vaccinated, communityID) ' +
  'VALUES (' + connection.escape(email) + ',' + connection.escape(firstName) + ',' + connection.escape(lastName) + ',' + connection.escape(pictureLink) + ',' + connection.escape(bio) + ',' + connection.escape(phoneNumber) + ',' + vaccinated + ',' + communityID + ');'
  ).then(response => {
  	res.sendStatus(200);
  }, error => {
  	console.log(error);
  	res.sendStatus(500);
  });
});

app.get('/api/ping', async (req, res) => {
	res.sendStatus(200);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
