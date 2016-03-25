const db = require('./db')
const config = require('../config')
const funcMap = {
  tg: getTargetValue,
  rt: getSyuritu
}
const getData = Object.keys(funcMap)

module.exports = function (req, cb) {
  var bindVals = buildBindVals(req)
  var results = {}
  var counter = getData.length
  getData.forEach(function (key) {
    results[key] = []
    funcMap[key](bindVals[key], function (data) {
      results[key] = data
      if (--counter === 0) buildData(results, cb)
    })
  })
}

function buildData (data, cb) {
  cb(data)
}

function buildBindVals (req) {
  var shn_cd = config.shnCds[req.shn] || config.shnCds.icc
  var bindVals = {
    tg: {
      shn_cd: shn_cd
    }, rt: {
      shn_cd: shn_cd,
      jz_ymd_from: req.ymd_from,
      jz_ymd_to: req.ymd_to,
      pro_cd_0: ['0701', '0703']
    }
  }

  return bindVals
}

// 製品ｺｰﾄﾞ="2922”(ICC) &　品種ｺｰﾄﾞ(10桁目) <> "G" 　：目標値１
// 製品ｺｰﾄﾞ="2922”(ICC) &　品種ｺｰﾄﾞ(10桁目) =  "G" 　：目標値２
// 製品ｺｰﾄﾞ="2924”(TSA) ：目標値１
// 製品ｺｰﾄﾞ="2926”(NCF) ：目標値１
// 製品ｺｰﾄﾞ="2927”(TPI) ：目標値１


function getTargetValue (vals, cb) {
  var query = 'SELECT SHN_CD, SYURIT_VAL1, SYURIT_VAL2' +
              ' FROM ENSTMSEIHN' +
              ' WHERE SHN_CD = :shn_cd'
  db(query, vals, function (data) {
    cb(data[0][1])
  })
}

function getSyuritu (vals, cb) {
  var proCds = vals['pro_cd_0']
  var proCdQuery = ''
  for (var i in proCds) {
    var key = 'pro_cd_' + i
    proCdQuery += (i > 0 ? ', :' : ':') + key
    vals[key] = proCds[i]
  }
  var query = 'SELECT TO_CHAR(jz_ymd, \'yyyy/mm/dd\')' +
              ', ROUND(SUM(s_ryo) / SUM(tny_ryo),2) * 100 syuritu' +
              ' FROM enstdsgnpo sgn' +
              ' LEFT JOIN enstmshins his ON sgn.S_HISCD = his.SHN_HISCD' +
              ' WHERE shn_cd = :shn_cd' +
              ' AND pro_cd IN(' + proCdQuery + ')' +
              ' AND JZ_YMD >= TO_DATE(:jz_ymd_from, \'yyyy/mm/dd\')' +
              ' AND JZ_YMD <= TO_DATE(:jz_ymd_to, \'yyyy/mm/dd\')' +
              ' GROUP BY jz_ymd ORDER BY jz_ymd'

  db(query, vals, cb)
}
