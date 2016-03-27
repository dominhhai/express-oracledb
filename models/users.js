const db = require('./db')

module.exports = function (req, cb) {
  db('SELECT name FROM USERS WHERE id=:id', req, function (result) {
    var name = result.length > 0 ? result[0][0] : 'no-name'
    cb(name)
  })
}
