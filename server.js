var dbRouter = require('index-card-db-api');

var express = require('express');
var app = express();

app.use('/db', dbRouter);

app.get('/', express.static(__dirname));

var server = app.listen('8080', function() {
  console.log(server.address());
});
