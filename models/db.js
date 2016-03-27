const oracledb = {}//require('oracledb')
const config = require('../config/config')
var log = require('log4js').getLogger('db')
var pool = null
var openConnections = []

function createPool (cb) {
  if (pool) return cb()
  log.info('create a new pool')
  var authInfo = {
    user: config.oracledb.user,
    password: config.oracledb.password,
    connectString: config.oracledb.connectString
  }
  oracledb.createPool(authInfo, function (err, _pool) {
    if (err) {
      log.error(config.messages.ERR_DB_GET_POOL)
      return cb(err)
    }
    log.info('created a new pool successfully')
    pool = _pool
    cb()
  })
}

function terminatePool (cb) {
  if (pool) {
    log.info('terminate pool')
    releaseOpenConnections(function () {
      pool.terminate(function (err) {
        if (err) log.error(err)
        pool = null
        log.info('Pool is terminated')
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
      if (err) log.error(err)
      counter--
      if (counter === 0) return cb()
    })
  })
}

function execute (query, params, cb, numRows) {
  getConnection(function (err, connection) {
    if (err) return cb(err)
    log.info('・query:', query, '\n・params:', params)
    connection.execute(query, params, { resultSet: true }, function (err, result) {
      if (err) return cb(err.message)
      numRows = numRows || config.oracledb.numRows
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
        log.error(config.messages.ERR_DB_GET_CONNECTION)
        return cb(err)
      }
      openConnections.push(connection)
      cb(null, connection)
    })
  })
}

function closeResultSet (connection, resultSet) {
  resultSet.close(function (err) {
    if (err) log.error(err.message)
    releaseConnection(connection)
  })
}

function releaseConnection (connection) {
  var index = openConnections.indexOf(connection)
  if (index >= 0) {
    openConnections.splice(index, 1)
  }
  connection.release(function (err) {
    if (err) log.error(err)
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

function simpleExecute (query, params, cb, numRows) {
  var result = []
  execute(query, params, function (err, rows) {
    if (err) {
      log.error(err)
      return cb([])
    }
    if (rows.length > 0) {
      result = result.concat(rows)
    } else {
      cb(result)
    }
  }, numRows)
}

exports = module.exports = simpleExecute
exports.execute = execute
exports.createPool = createPool
exports.terminatePool = terminatePool
exports.getConnection = getConnection
exports.closeResultSet = closeResultSet
exports.releaseConnection = releaseConnection
