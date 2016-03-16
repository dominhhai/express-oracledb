const express = require('express')
const router = express.Router()
const model = require('../models/model')
const funcMap = {
  nk: getNyukojisseki,
  shuritu: getShuritu
}

router.use(function (req, res, next) {
  res.locals.title = 'HOME'
  next()
})

/* GET home page. */
router.get('/', function (req, res, next) {
  var view = {
    jsScripts: [
      '<script src="https://www.google.com/jsapi?autoload={\'modules\':[{\'name\':\'visualization\',\'version\':\'1.0\',\'packages\':[\'corechart\']}]}"></script>',
      '<script src="/js/graph.js"></script>'
    ]
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

function getNyukojisseki (data, cb) {
  var result = []

  var query = 'SELECT shn_hiscd, konpo_shaba, sum(KONPO_LEN),' +
              ' sum(KONPO_SRY), TO_CHAR(NK_YMD, \'yyyy/mm/dd\')' +
              ' FROM enstdnyulg' +
              ' WHERE shn_cd = :shn_cd' +
              ' AND NK_KBN = :nk_kbn' +
              ' AND NK_YMD >= TO_DATE(:nk_ymd_from, \'yyyy/mm/dd\')' +
              ' AND NK_YMD <= TO_DATE(:nk_ymd_to, \'yyyy/mm/dd\')' +
              ' GROUP BY shn_hiscd, konpo_shaba, NK_YMD ORDER BY shn_hiscd'

  model(query, data, function (err, rows) {
    if (err) {
      cb([])
      return console.error(err)
    }
    if (rows.length > 0) {
      result = result.concat(rows)
    } else {
      cb(result)
    }
  })
}

function getShuritu (data, cb) {
  var result = []

  var proCds = data['pro_cd_0']
  var proCdQuery = ''
  for (var i in proCds) {
    var key = 'pro_cd_' + i
    proCdQuery += (i > 0 ? ', :' : ':') + key
    data[key] = proCds[i]
  }
  var query = 'SELECT TO_CHAR(jz_ymd, \'yyyy/mm/dd\'),' +
              ' ROUND(SUM(s_ryo) / SUM(tny_ryo),2) * 100 syuritu' +
              ' FROM enstdsgnpo sgn' +
              ' LEFT JOIN enstmshins his ON sgn.S_HISCD = his.SHN_HISCD' +
              ' WHERE shn_cd = :shn_cd' +
              ' AND pro_cd IN(' + proCdQuery + ')' +
              ' AND JZ_YMD >= TO_DATE(:jz_ymd_from, \'yyyy/mm/dd\')' +
              ' AND JZ_YMD <= TO_DATE(:jz_ymd_to, \'yyyy/mm/dd\')' +
              ' GROUP BY jz_ymd ORDER BY jz_ymd'

  model(query, data, function (err, rows) {
    if (err) {
      cb([])
      return console.error(err)
    }
    if (rows.length > 0) {
      result = result.concat(rows)
    } else {
      cb(result)
    }
  })
}

module.exports = router
