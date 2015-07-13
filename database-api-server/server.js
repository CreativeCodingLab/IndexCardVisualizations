var express = require("express");
var bodyParser = require('body-parser')
var MongoClient = require('mongodb').MongoClient
var assert = require("assert");
var app = express();

var db_name = "index_cards_v2";
var db_url = "mongodb://127.0.0.1:27017/" + db_name;

var db = MongoClient.connect(db_url);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var i = 0;

app.get("/foo/:limit", function(request, response) {
    response.end(request.params.limit);
})

app.post("/get-one", bodyParser, function(request, response) {
    response.end("ack");
    // response.end(request.body)
    // response.write("[")
    // db.then(function(db) {
    //     return db.collection("card_matches")
    //         .find({ score: { $gt: 0 }, _participant_b_ids: request.params.query })
    //         .stream({ transform: function(doc) { return JSON.stringify(doc); }});
    // })
    // .then(function(stream) {
    //     stream.once("end", function() { response.write("]"); response.end() });
    //     stream.on("data", function(d) { response.write(d); response.write(",") });
    // })
    // // response.end(request.params.query)
});

app.get("/matches/score-above-zero/participant-b/:query", function(request, response) {
    response.write("[")
    db.then(function(db) {
        return db.collection("card_matches")
            .find({ score: { $gt: 0 }, _participant_b_ids: request.params.query })
            .stream({ transform: function(doc) { return JSON.stringify(doc); }});
    })
    .then(function(stream) {
        stream.once("end", function() { response.write("]"); response.end() });
        stream.on("data", function(d) { response.write(d); response.write(",") });
    })
    // response.end(request.params.query)
});

app.get("/matches/score-above-zero-stream-limit/:limit", function(request, response) {
    response.write("[")
    db.then(function(db) {
        return db.collection("card_matches")
            .find({ score: { $gt: 0 } })
            .limit(parseInt(request.params.limit))
            .stream({ transform: function(doc) { return JSON.stringify(doc); }});
    })
    .then(function(stream) {
        stream.once("end", function() { response.write("]"); response.end() });
        stream.on("data", function(d) { response.write(d); response.write(",") });
    })
});

app.get("/matches/score-above-zero-stream.json", function(request, response) {
    response.write("[")
    db.then(function(db) {
        return db.collection("card_matches").find({ score: { $gt: 0 } })
            .stream({ transform: function(doc) { return JSON.stringify(doc); }});
    })
    .then(function(stream) {
        stream.once("end", function() { response.write("]"); response.end() });
        stream.on("data", function(d) { response.write(d); response.write(",") });
    })
});

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
