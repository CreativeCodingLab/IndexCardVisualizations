express = require "express"
app = express()
app.use(express.static(__dirname))
port = process.argv[2] || process.env.PORT
server = app.listen port, "0.0.0.0", ->
    console.log server.address()