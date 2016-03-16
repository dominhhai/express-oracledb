const oracledb = require('oracledb')
const dbconfig = require('../dbconfig')
const messages = require('./messages')
var pool = null
var openConnections = []

function createPool (cb) {
  if (pool) return cb()
  console.log('create a new pool')
  var authInfo = {
    user: dbconfig.user,
    password: dbconfig.password,
    connectString: dbconfig.connectString
  }
  oracledb.createPool(authInfo, function (err, _pool) {
    if (err) {
      console.error(messages.ERR_DB_GET_POOL)
      return cb(err)
    }
    console.log('created a new pool successfully')
    pool = _pool
    cb()
  })
}

function terminatePool (cb) {
  if (pool) {
    releaseOpenConnections(function () {
      pool.terminate(function (err) {
        console.error(err)
        pool = null
        cb()
      })
    })
  } else {
    cb()
  }
}

function releaseOpenConnections (cb) {
  var counter = openConnections.length
  if (counter === 0) return cb()
  openConnections.forEach(function (connection) {
    connection.release(function (err) {
      if (err) console.error(err)
      counter--
      if (counter === 0) return cb()
    })
  })
}

function execute (query, params, cb, numRows) {
  getConnection(function (err, connection) {
    if (err) return cb(err)
    console.log('・query:', query, '\n・params:', params)
    connection.execute(query, params, { resultSet: true }, function (err, result) {
      if (err) return cb(err.message)
      numRows = numRows || dbconfig.numRows
      // use `cursor` when executing PLSQL function/proceduces
      var resultSet = result.resultSet || result.outBinds.cursor
      fetchRowsFromRS(connection, resultSet, numRows, cb)
    })
  })
}

function getConnection (cb) {
  createPool(function (err) {
    if (err)  return cb(err)
    pool.getConnection(function (err, connection) {
      if (err) {
        console.error(messages.ERR_DB_GET_CONNECTION)
        return cb(err)
      }
      openConnections.push(connection)
      cb(null, connection)
    })
  })
}

function closeResultSet (connection, resultSet) {
  resultSet.close(function (err) {
    if (err) console.error(err.message)
    releaseConnection(connection)
  })
}

function releaseConnection (connection) {
  var index = openConnections.indexOf(connection)
  if (index >= 0) {
    openConnections.splice(index, 1)
  }
  connection.release(function (err) {
    if (err) console.error(err)
  })
}

function fetchRowsFromRS (connection, resultSet, numRows, cb) {
  resultSet.getRows(numRows, function (err, rows) {
    if (err) {
      cb(err.message)
      closeResultSet(connection, resultSet)
    } else if (rows.length === 0) {
      cb(null, [])
      closeResultSet(connection, resultSet)
    } else if (rows.length > 0) {
      cb(null, rows)
      fetchRowsFromRS(connection, resultSet, numRows, cb)
    }
  })
}

exports = module.exports = execute
exports.createPool = createPool
exports.terminatePool = terminatePool
exports.getConnection = getConnection
exports.closeResultSet = closeResultSet
exports.releaseConnection = releaseConnection
