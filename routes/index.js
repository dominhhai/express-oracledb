const express = require('express')
const router = express.Router()
const syuritu = require('../models/syuritu')
const nyuko = require('../models/nyuko')
const config = require('../config/config')
const funcMap = {
  syuritu: getSyuritu,
  nyuko: getNyuko
}

router.use(function (req, res, next) {
  res.locals.title = 'HOME'
  next()
})

/* GET home page. */
router.get('/', function (req, res, next) {
  var view = {
    stylesheets: [
      '/reveal/css/reveal',
      '/reveal/css/theme/simple'
    ], jsScripts: [
      // '<script src="https://www.google.com/jsapi?autoload={\'modules\':[{\'name\':\'visualization\',\'version\':\'1.0\',\'packages\':[\'corechart\']}]}"></script>',
      '<script src="/google/corechart.js"></script>',
      '<script src="/reveal/lib/head.min.js"></script>',
      '<script src="/reveal/reveal.js"></script>',
      '<script>var REFRESH_TIME = '+ config.chart.refresh_time +
        ';var NUM_ERRORS = '+ config.chart.get_data_num_errors +
        ';var SLIDE_TIME = '+ config.chart.slide_time +
      '</script>',
      '<script src="/js/graph.js"></script>'
    ], msg: {
      title: '操業トピックス',
      content: '・ＴＰＩ　お客様評価中 結果良好であれば再開予定'
    }, bumon: {
      b: '電生部門',
      g: '実装材管理グループ'
    }
  }
  res.render('index', view)
})

router.post('/graph', function (req, res, next) {
  var type = req.body.type
  var data = req.body.data
  if (funcMap.hasOwnProperty(type)) {
    funcMap[type](data, function (result) {
      res.send(result)
    })
  } else {
    res.send([])
  }
})

function getSyuritu (req, cb) {
  syuritu(req, function (data) {
    // result[ ...[日付, 収率, 収率の表示, 目標値]  ]
    // 収率の表示：本日のデータしか表示しない
    var target = data.tg
    var result = data.rt.map(function (val) {
      val.push(val[0] === req.ymd_to ? val[1] : null, null)
      return val
    })
    result.push([req.ymd_from, null, null, target])
    result.push([req.ymd_to, null, null, target])
    cb(result)
  })
}

function getNyuko (req, cb) {
  nyuko(req, function (data) {
    // result[ ...
    //  [品種　計画量合計, 今計画量, 次計画量,   null,   null]
    //  [     達成量合計,    null,    null, 入庫済み, 在庫量]
    // ]
    var result = []
    var empty = ['', null, null, null, null, null, null]
    for (var his in data) {
      if (data.hasOwnProperty(his)) {
        if (result.length > 0) {
          result.push(empty)
        }
        var val = data[his]
        var planTotal = val.plan.total || 0
        var nzkTotal = val.total || 0
        result.push([
          his,
          val.plan[req.ym_from] || 0,
          val.plan[req.ym_to] || 0,
          null, null,
          0.001, planTotal.toLocaleString()
        ], [
          '',
          null, null,
          val.nk || 0,
          val.zk || 0,
          0.001, nzkTotal.toLocaleString()
        ])
      }
    }

    cb(result)
  })
}

module.exports = router
