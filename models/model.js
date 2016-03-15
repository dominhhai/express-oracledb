const oracledb = require('oracledb')
const dbconfig = require('../dbconfig')
const messages = require('./messages')

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
  var authInfo = {
    user: dbconfig.user,
    password: dbconfig.password,
    connectString: dbconfig.connectString
  }
  oracledb.createPool(authInfo, function (err, pool) {
    if (err) {
      console.error(messages.ERR_DB_GET_POOL)
      return cb(err)
    }
    pool.getConnection(function (err, connection) {
      if (err) {
        console.error(messages.ERR_DB_GET_CONNECTION)
        return cb(err)
      }
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
exports.getConnection = getConnection
exports.closeResultSet = closeResultSet
exports.releaseConnection = releaseConnection
