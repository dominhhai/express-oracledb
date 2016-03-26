const db = require('./db')
const config = require('../config')
const funcMap = {
  plan: getPlan,
  nk: getNyuko,
  zk: getZaiko
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
  var result = data.plan
  var keys = ['nk', 'zk']
  keys.forEach(function (key) {
    data[key].forEach(function (row) {
      var hiscd = row[0]
      var val = result[hiscd] || {}
      val[key] = row[1]
      val.total = (val.total || 0) + row[1]
      val.plan = val.plan || {}
      result[hiscd] = val
    })
  })
  cb(result)
}

function buildBindVals (req) {
  var shn_cd = config.shnCds[req.shn] || config.shnCds.icc
  var proCds = ['0404', '0454', '0701']
  if (shn_cd === config.shnCds.tsa) {
    proCds = ['0307', '0504', '0703']
  } else if (shn_cd === config.shnCds.lpa) {
    proCds = ['0309', '0504', '0703']
  }
  var bindVals = {
    plan: {
      shn_cd: shn_cd,
      nk_ym_from: req.ym_from,
      nk_ym_to: req.ym_to
    }, nk: {
      shn_cd: shn_cd,
      nk_kbn: '1',
      nk_ymd_from: req.ym_from + '/01',
      nk_ymd_to: req.ym_to + '/01'
    }, zk: {
      shn_cd: shn_cd,
      pro_cd_0: proCds
    }
  }

  return bindVals
}

function getPlan (vals, cb) {
  var searchQuery = ' FROM ENSTDNYUPL' +
                    ' WHERE SHN_CD = :shn_cd' +
                    ' AND NK_YM >= :nk_ym_from' +
                    ' AND NK_YM <= :nk_ym_to'
  var query = vals.shn_cd === config.shnCds.icc ?
                'SELECT TRIM(SHN_HISCD), NK_YM, SUM(NK_LEN)' +
                searchQuery +
                ' GROUP BY SHN_HISCD, NK_YM ORDER BY SHN_HISCD, NK_YM'
              :
                'SELECT TRIM(SHN_HISCD || SHN_HABA) HIS_HABA' +
                ', NK_YM, SUM(NK_LEN)' +
                searchQuery +
                ' GROUP BY SHN_HISCD, SHN_HABA, NK_YM ORDER BY HIS_HABA, NK_YM'
  db(query, vals, function (data) {
    var result = {}
    data.forEach(function (row) {
      var key = row[0]
      var val = result[key] || {plan: {total: 0}}
      val.plan[row[1]] = row[2]
      val.plan.total += row[2]

      result[key] = val
    })
    cb(result)
  })
}

function getNyuko (vals, cb) {
  var searchQuery = ' FROM ENSTDNYULG' +
                    ' WHERE SHN_CD = :shn_cd' +
                    ' AND NK_KBN = :nk_kbn' +
                    ' AND NK_YMD >= TO_DATE(:nk_ymd_from, \'yyyy/mm/dd\')' +
                    ' AND NK_YMD < TO_DATE(:nk_ymd_to, \'yyyy/mm/dd\')'
  var query = vals.shn_cd === config.shnCds.icc ?
                'SELECT TRIM(SHN_HISCD), SUM(KONPO_LEN)' +
                searchQuery +
                ' GROUP BY SHN_HISCD ORDER BY SHN_HISCD'
              :
                'SELECT TRIM(sHN_HISCD || KONPO_SHABA) || \'mm\' HIS_HABA' +
                ', SUM(KONPO_LEN)' +
                searchQuery +
                ' GROUP BY SHN_HISCD, KONPO_SHABA ORDER BY HIS_HABA'
  db(query, vals, cb)
}

function getZaiko (vals, cb) {
  var proCds = vals['pro_cd_0']
  var proCdQuery = ''
  for (var i in proCds) {
    var key = 'pro_cd_' + i
    proCdQuery += (i > 0 ? ', :' : ':') + key
    vals[key] = proCds[i]
  }
  var searchQuery = ' FROM ENSTDSIKAZ S' +
                    ' LEFT JOIN ENSTMKOTEI K ON S.PRO_CD = K.PRO_CD' +
                    ' WHERE S.SHN_CD = :shn_cd' +
                    ' AND S.PRO_CD IN(' + proCdQuery + ')'
  var query = vals.shn_cd === config.shnCds.icc ?
                'SELECT TRIM(S.SHN_HISCD), SUM(S.SHIK_LEN)' +
                searchQuery +
                ' GROUP BY SHN_HISCD ORDER BY s.SHN_HISCD'
              :
                'SELECT TRIM(S.SHN_HISCD || SHIK_SHABA) || \'mm\' HIS_HABA' +
                ', SUM(S.SHIK_LEN)' +
                searchQuery +
                ' GROUP BY SHN_HISCD,SHIK_SHABA ORDER BY s.SHN_HISCD'
  db(query, vals, cb)
}
