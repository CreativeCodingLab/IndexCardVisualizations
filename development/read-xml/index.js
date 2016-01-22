var Rx = require('rx');
var path = require('path');
var fs = require('fs');
var assert = require('assert');

// var stream = Rx.Observable;

var dataPath = path.resolve(__dirname, '..', 'example-data')

var cardPath = path.resolve(dataPath, 'PMC29063-UAZ-r1-1.json');
var xmlPath = path.resolve(dataPath, 'PMC29063.nxml');

var indexCard = require(cardPath)

fs.readFile(xmlPath, function(err, buffer) {
  console.log(buffer.toString())
  console.log('index card meta:', indexCard.meta)
})

// console.log(indexCard)

// stream.fromNodeCallback(fs.readFile)(xmlPath)
//   .subscribe(function(buffer) {
//     console.log(buffer.toString())
//     console.log('index card meta:', indexCard.meta)
//   })
