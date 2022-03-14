const express = require('express');
const mysql = require('mysql')
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
const port = 8000;

const db = mysql.createConnection({ 
    host     : 'localhost', 
    user     : 'root',
    password : '',
    database : 'mymessages'
    })
db.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
      });

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/api/messages', (req, res) => {
    db.query("SELECT * FROM main_app_message", function (err, result, fields) {
        console.log('Connection result error '+err);
        console.log('no of records is '+result.length);
        res.writeHead(200, { 'Content-Type': 'application/json'});
        res.end(JSON.stringify(result));
      });
});

app.post('/api/messages', (req, res) => {
    var uuid = req.body['uuid']
    var author = req.body['author'] 
    var message = req.body['message'] 
    var likes = req.body['likes'] 
    var query = `INSERT INTO main_app_message (uuid, author, message, likes) VALUES ( ?, ?, ?, ?)`;
    db.query(query, [uuid, author, message, likes], (err, rows) => {
            if (err) throw err;
            console.log("Row inserted with id = "
                + rows.insertId);
        })
    res.status(201);
    res.send('complete')
});

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});