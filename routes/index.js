const express = require('express')
const router = express.Router()
const users = require('../models/users')

router.use(function (req, res, next) {
  res.locals.title = 'HOME'
  next()
})

/* GET home page. */
router.get('/', function (req, res, next) {
  var view = {
    title: 'HOME'
  }
  users({id: 10}, function (name) {
    view.username = name

    res.render('index', view)
  })
})

module.exports = router
