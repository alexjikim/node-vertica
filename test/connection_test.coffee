path   = require 'path'
fs     = require 'fs'
vows   = require 'vows'
assert = require 'assert'

if !fs.existsSync('./test/connection.json')
  console.error "Create test/connection.json to run functional tests"

else
  Vertica = require('../src/vertica')
  baseConnectionInfo = JSON.parse(fs.readFileSync('./test/connection.json'))

  # help function to connect
  connect = (info, callback) ->
    for key, value of baseConnectionInfo
      info[key] ?= value
      
    connection = Vertica.connect info, (err) -> callback(err, connection)
    undefined
  

  vow = vows.describe('Query')

  vow.addBatch
    "it should connect properly with the base info":
      topic: -> connect({}, @callback)

      "it should not have an error message": (err, _) ->
        assert.equal err, null

      "it should have a non-busy, working connection": (_, connection) ->
        assert.equal connection.busy, false
        assert.equal connection.connected, true

    "it should return an error if the connection attempt fails":
      topic: -> connect(password: 'absolute_nonsense', @callback)

      "it should not have an error message": (err, _) ->
        assert.ok err?, "Connecting should fail with a wrong password."

    "it should use SSL if requested":
      topic: -> connect(ssl: 'required', @callback)

      "it should connect with an cleartext and encrypted socket pair": (err, conn) ->
        if err != 'The server does not support SSL connection'
          assert.ok conn.isSSL(), "Connection should be using SSL but isn't."

    "it should not use SSL if explicitely requested":
      topic: -> connect(ssl: false, @callback)

      "it should connect without an SSL socket": (_, conn) ->
        assert.ok !conn.isSSL()

  vow.export(module)
