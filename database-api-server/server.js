var express = require("express");
var bodyParser = require('body-parser')
var MongoClient = require('mongodb').MongoClient
var assert = require("assert");
var app = express();

var db_name = "index_cards_v2";
var db_url = "mongodb://127.0.0.1:27017/" + db_name;

var db = MongoClient.connect(db_url);

app.get("/matches/score-above-zero.json", function(request, response) {
    db.then(function(db) {
        return db.collection("card_matches").find({ score: { $gt: 0 } }).toArray()
    })
    .then(function(json) {
        response.json(json);
    })
});

app.get("/matches/all-matches-count.json", function(request, response) {
    db.then(function(db) {
        return db.collection("card_matches").count()
    })
    .then(function(json) {
        response.json(json);
    })
});

var server = app.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
