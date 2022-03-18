const express = require('express');
const mysql = require('mysql')
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
const port = 8000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'main_app'
})
db.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/api/messages', (req, res) => {
    db.query("SELECT * FROM mymessages", function (err, result, fields) {
        console.log('no of records is ' + result.length);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
    });
});

app.post('/api/messages', (req, res) => {
    var uuid = req.body['uuid']
    var author = req.body['author']
    var message = req.body['message']
    var likes = req.body['likes']
    var query_exist = "SELECT count(*) AS `number` FROM mymessages WHERE uuid = ?"
    db.query(query_exist, [uuid], function (err, result, fields) {
        if (result[0].number == 0) {
            var query_insert_mymessages = `INSERT INTO mymessages (uuid, author, message, likes) VALUES ( ?, ?, ?, ?)`;
            db.query(query_insert_mymessages, [uuid, author, message, likes], (err, rows) => {
                if (err) throw err;
                console.log('add uuid = ' + uuid)
            })
            var data = {
                'author':author,
                'message':message,
                'likes':likes
            }
            var query_insert_updated = `INSERT INTO updated_change (uuid, action, data) VALUES ( ?, ?, ? )`;
            db.query(query_insert_updated, [uuid, "insert", JSON.stringify(data) ], (err, rows) => {
                if (err) throw err;
            })
            res.status(201);
            res.send('Suucessful save ' + uuid)
        }
        else {
            res.status(401);
            res.send("UUID is already exists.")
        }
    });
});

app.put('/api/messages/:uuid', (req, res) => {
    var uuid = req.params.uuid
    var author = req.body['author']
    var message = req.body['message']
    var likes = req.body['likes']
    var query_exist = "SELECT count(*) AS `number` FROM mymessages WHERE uuid = ?"
    db.query(query_exist, [uuid], function (err, result, fields) {
        if (result[0].number == 0) {
            res.status(404);
            res.send("UUID is not found.")
        }
        else {
            var query_update = `UPDATE mymessages SET author=?, message=?, likes=? WHERE uuid = ?`;
            db.query(query_update, [author, message, likes, uuid], (err, rows) => {
                if (err) throw err;
                console.log('update uuid = ' + uuid)
            })
            var data = {
                'author':author,
                'message':message,
                'likes':likes
            }
            var query_insert_updated = `INSERT INTO updated_change (uuid, action, data) VALUES ( ?, ?, ? )`;
            db.query(query_insert_updated, [uuid, "update", JSON.stringify(data) ], (err, rows) => {
                if (err) throw err;
            })
            res.status(204);
            res.send("Suucessful update")
        }
    });
});

app.delete('/api/messages/:uuid', (req, res) => {
    var uuid = req.params.uuid
    var query_exist = "SELECT count(*) AS `number` FROM mymessages WHERE uuid = ?"
    db.query(query_exist, [uuid], function (err, result, fields) {
        if (result[0].number == 0) {
            res.status(404);
            res.send("UUID is not found.")
        }
        else {
            var query_delete_mymessages = `DELETE FROM  mymessages WHERE uuid = ?`;
            db.query(query_delete_mymessages, [uuid], (err, rows) => {
                if (err) throw err;
                console.log('delete uuid = ' + uuid)
            })
            var query_insert_updated = `INSERT INTO updated_change (uuid, action, data) VALUES ( ?, ?, ? )`;
            db.query(query_insert_updated, [uuid, "delete", "" ], (err, rows) => {
                if (err) throw err;
            })
            res.status(204);
            res.send("Suucessful delete")
        }
    });
});

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});