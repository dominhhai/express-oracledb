var graphMap = {
  chart_icc_syuritu: [buildChartIccSyurituReqData, renderChartIccSyuritu, {}],
  chart_icc_nyuko: [buildChartIccNyukoReqData, renderChartIccNyuko, {}],
  chart_tsa_syuritu: [buildChartTsaSyurituReqData, renderChartIccSyuritu, {}],
  chart_tsa_nyuko: [buildChartTsaNyukoReqData, renderChartIccNyuko, {}],
  chart_lpa_syuritu: [buildChartLpaSyurituReqData, renderChartIccSyuritu, {}],
  chart_lpa_nyuko: [buildChartLpaNyukoReqData, renderChartIccNyuko, {}]
}
var graphs = Object.keys(graphMap)
var counter = 0
var num_err = 0
var visual

var firstday
var today
var thisMonth
var nextMonth

var resizeTimer
window.onresize = function (e) {
  var slideHeight = $('.reveal').height()
  var slideTitleHeight = $('.slide-title').outerHeight()
  var chartTitleHeight = $('.chart_title').outerHeight()
  var chartHight = slideHeight - slideTitleHeight - chartTitleHeight - 15
  $('.chart-content').height(chartHight)

  clearTimeout(resizeTimer)
  // Run code here, resizing has "stopped"
  resizeTimer = setTimeout(function() {
    redrawGraph()
  }, 5)
}

Reveal.initialize({
  width: '100%',
  height: '100%',
  margin: 0,
  autoSlide: SLIDE_TIME,
  loop: true,
  dependencies: [
    { src: '/reveal/lib/classList.js', condition: function () { return !document.body.classList } },
    { src: '/reveal/plugin/zoom.js', async: false }
  ]
})

var startCount = 0
Reveal.addEventListener('ready', function (e) {
  $(window).trigger('resize')
  startCount ++
  if (startCount == 2) refreshData()
})

google.setOnLoadCallback(function () {
  visual = google.visualization
  startCount ++
  if (startCount == 2) refreshData()
})

function refreshData () {
  setDate()
  // console.log('Fetch New Data at', new Date())
  counter = graphs.length
  // graphs.forEach(function (ele) {
  //   loadGraphData(ele)
  // })
  test()
}

function setDate () {
  var _today = today
  var date = new Date()
  var curYmd = getYMD(date)
  thisMonth = curYmd.y + '/' + curYmd.mm
  today = thisMonth + '/' + curYmd.dd

  date.setMonth(curYmd.m - 2)
  var preYmd = getYMD(date)
  firstday = preYmd.y + '/' + preYmd.mm + '/' + preYmd.dd

  date.setMonth(curYmd.m)
  var nextYmd = getYMD(date)
  nextMonth = nextYmd.y + '/' + nextYmd.mm

  if (_today !== today) {
    $('.slide-title .today').text(curYmd.y + '年' + curYmd.m + '月' + curYmd.d + '日')
    $('.shuritu').text('検反収率　' + preYmd.m + '/' + preYmd.d + '～' + curYmd.m + '/' + curYmd.d)
    $('.nyuko').text('入庫実績　' + curYmd.y + '年' + curYmd.m + '月')
  }
}

function getYMD (date) {
  var ymd = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
  }
  ymd.mm = (ymd.m < 10) ? ('0' + ymd.m) : ymd.m
  ymd.dd = (ymd.d < 10) ? ('0' + ymd.d) : ymd.d

  return ymd
}

function loadGraphData (gEle) {
  var data = buildReqData(gEle)
  if (data == null) {
    next(true)
    return // console.error('build request data fail:', gEle)
  }
  $.ajax({
    url: '/graph',
    type: 'POST',
    data: data,
    success: function (result) {
      renderGraph(gEle, result)
      next(true)
    },
    error: function (e) {
      next(false)
    }
  })
}

function next (isSuccess) {
  if (isSuccess) {
    num_err = 0
  } else {
    num_err++
    // console.error('load data error (', num_err, ')')
  }
  // load newest data after `REFRESH_TIME`
  if (num_err < NUM_ERRORS * graphs.length) {
    counter--
    if (counter <= 0) {
      setTimeout(refreshData, REFRESH_TIME)
    }
  } else {
    // console.error('Stop loading graph because of server error')
    if (window.confirm('サーバーに接続できないため、自動更新を停止しました。このページを再読み込みますか？')) {
      window.location.reload(true)
    }
  }
}

function buildReqData (gEle) {
  if (graphMap.hasOwnProperty(gEle)) {
    return graphMap[gEle][0](gEle)
  } else {
    // console.error('NO buildRequestData method for', gEle, 'element')
    window.alert('NO buildRequestData method for ' + gEle + ' element')
    return null
  }
}

function renderGraph (gEle, data) {
  if (data == null || data.length === 0) {
    var jEle = $('#' + gEle)
    jEle.html('<b>データがありません。</b>')
    return // console.log('No data for', gEle)
  }
  if (graphMap.hasOwnProperty(gEle)) {
    graphMap[gEle][2] = graphMap[gEle][1](gEle, data, graphMap[gEle][2])
    // console.log('rendered', gEle)
  } else {
    // console.error('NO render method for', gEle, 'element')
    window.alert('NO render method for ' + gEle + ' element')
  }
}

function redrawGraph () {
  graphs.forEach(function (ele) {
    var graph = graphMap[ele][2]
    if (graph.chart) {
      if (graph.area) graph.opt.chartArea = graph.area(ele)
      // console.error(graph.opt)
      graph.chart.draw(graph.data, graph.opt)
    }
  })
}

// ▼ICCグラフ
// 検反収率
function buildChartIccSyurituReqData (gEle) {
  var data = {
    type: 'syuritu',
    data: {
      shn: 'icc',
      ymd_from: firstday,
      ymd_to: today
    }
  }

  return data
}

function renderChartIccSyuritu (gEle, data, graph) {
  graph = graph || {}
  data = data.map(function (val) {
    val[0] = new Date(val[0])
    return val
  })
  var graphData = new visual.DataTable()
  graphData.addColumn('date', '日付')
  graphData.addColumn('number', '収率')
  graphData.addColumn({type: 'number', role:'annotation'})
  graphData.addColumn('number', '目標')
  graphData.addRows(data)

  var target = data[data.length - 1][3]
  var options = graph.opt || {
    colors: ['#F00'],
    pointShape: 'diamond',
    pointSize: '15',
    hAxis: {
      title: '日付',
      titleTextStyle: { bold: true, italic: false },
      format: 'd',  gridlines: {count: 31}
    },
    vAxis: {
      title: '検反収率（％）',
      titleTextStyle: { bold: true, italic: false }
    },
    series: {
      0: {visibleInLegend: false},
      1: {
        lineWidth: 1,
        pointSize: 0,
        pointsVisible : false,
        color: 'blue',
        labelInLegend: '目標：' + target + '%',
        enableInteractivity: false
      }
    },
    legend: 'top',
    crosshair: { trigger: 'both' },
    chartArea: getChartIccSyurituArea(gEle),
    animation: {startup: true, duration: 1500, easing: 'out'}
  }

  var chart = graph.chart || new visual.ScatterChart(document.getElementById(gEle))
  chart.draw(graphData, options)

  return {chart: chart, opt: options, data: graphData, area: getChartIccSyurituArea}
}

function getChartIccSyurituArea (gEle) {
  var chartWidth = $('#' + gEle).width()
  var left = 50
  var areaWidth = chartWidth - left - 40
  return { top: 50, left: left, width: areaWidth }
}

// 入庫実績
function buildChartIccNyukoReqData (gEle) {
  var data = {
    type: 'nyuko',
    data: {
      shn: 'icc',
      ym_from: thisMonth,
      ym_to: nextMonth
    }
  }

  return data
}

function renderChartIccNyuko (gEle, data, graph) {
  graph = graph || {}
  var graphData = new visual.DataTable()
  graphData.addColumn('string', '品種幅')
  graphData.addColumn('number', parseInt(thisMonth.substr(5, 2)) + '月の計画')
  graphData.addColumn('number', parseInt(nextMonth.substr(5, 2)) + '月の計画')
  graphData.addColumn('number', '入庫済み')
  graphData.addColumn('number', '在庫')
  graphData.addColumn('number', '合計')
  graphData.addColumn({type: 'string', role:'annotation'})
  graphData.addRows(data)

  var options = graph.opt || {
    legend: {position: 'top', maxLines: 2},
    isStacked: true,
    hAxis: {
      title: '入庫量（ｍ）',
      titleTextStyle: { bold: true, italic: false }
    },
    annotations: {
      alwaysOutside: true,
      textStyle: { color: 'black' }
    },
    series: {
      4: {
        visibleInLegend: false,
        color: 'white',
        enableInteractivity: false
      }
    },
    bar: { groupWidth: '99%' },
    chartArea: getChartIccNyukoArea(gEle),
    animation: {startup: true, duration: 1500, easing: 'out'}
  }

  var chart = graph.chart || new visual.BarChart(document.getElementById(gEle))
  chart.draw(graphData, options)

  return {chart: chart, opt: options, data: graphData, area: getChartIccNyukoArea}
}

function getChartIccNyukoArea (gEle) {
  var ele = $('#' + gEle)
  var chartWidth = ele.width()
  var chartHeight = ele.height()
  var top = 30
  var left = 250
  var right = 2
  var bottom = 50
  var areaWidth = '100%'//chartWidth - left - right
  var areaHeight = chartHeight - top - bottom
  return { left: left, width: areaWidth, height: areaHeight }
}
// ▲ICCグラフ

// ▼TSAグラフ
// 検反収率
function buildChartTsaSyurituReqData (gEle) {
  var data = {
    type: 'syuritu',
    data: {
      shn: 'tsa',
      ymd_from: firstday,
      ymd_to: today
    }
  }

  return data
}

// 入庫実績
function buildChartTsaNyukoReqData (gEle) {
  var data = {
    type: 'nyuko',
    data: {
      shn: 'tsa',
      ym_from: thisMonth,
      ym_to: nextMonth
    }
  }

  return data
}
// ▲TSAグラフ

// ▼LPAグラフ
// 検反収率
function buildChartLpaSyurituReqData (gEle) {
  var data = {
    type: 'syuritu',
    data: {
      shn: 'lpa',
      ymd_from: firstday,
      ymd_to: today
    }
  }

  return data
}

// 入庫実績
function buildChartLpaNyukoReqData (gEle) {
  var data = {
    type: 'nyuko',
    data: {
      shn: 'lpa',
      ym_from: thisMonth,
      ym_to: nextMonth
    }
  }

  return data
}
// ▲LpAグラフ

function test() {
  // barchart
  var data = [
    ['ABCDEFGHJKLREQHA　9999mm', 100, 200, null, null, 0.1, '0'],
    ['', null, null, 430, 213, 0.1, '1,000'],
    ['', null, null, null, null, null, null],
    ['defgaaa', 520, 307, null, null, 0.1, '40,000'],
    ['', null, null, 221, 113, 0.1, '1,000'],
    ['', null, null, null, null, null, null],
    ['defgaaa', 520, 307, null, null, 0.1, '40,000'],
    ['', null, null, 221, 113, 0.1, '1,000'],
    ['', null, null, null, null, null, null],
    ['defgaaa', 520, 307, null, null, 0.1, '40,000'],
    ['', null, null, 221, 113, 0.1, '1,000'],
    ['', null, null, null, null, null, null],
    ['defgaaa', 520, 307, null, null, 0.1, '40,000'],
    ['', null, null, 221, 113, 0.1, '1,000'],
    ['', null, null, null, null, null, null],
    ['defgaaa', 520, 307, null, null, 0.1, '40,000'],
    ['', null, null, 221, 113, 0.1, '1,000'],
    ['', null, null, null, null, null, null],
    ['defgaaa', 520, 307, null, null, 0.1, '40,000'],
    ['', null, null, 221, 113, 0.1, '1,000'],
    ['', null, null, null, null, null, null],
    ['defgaaa', 520, 307, null, null, 0.1, '40,000'],
    ['', null, null, 221, 113, 0.1, '1,000'],
    ['', null, null, null, null, null, null],
    ['defgaaa', 520, 307, null, null, 0.1, '40,000'],
    ['', null, null, 221, 113, 0.1, '1,000'],
    ['', null, null, null, null, null, null],
    ['defgaaa', 520, 307, null, null, 0.1, '40,000'],
    ['', null, null, 221, 113, 0.1, '1,000'],
    ['', null, null, null, null, null, null],
    ['defgaaa', 520, 307, null, null, 0.1, '40,000'],
    ['', null, null, 221, 113, 0.1, '1,000'],
    ['', null, null, null, null, null, null],
    ['defgaaa', 520, 307, null, null, 0.1, '40,000'],
    ['', null, null, 221, 113, 0.1, '1,000'],
    ['', null, null, null, null, null, null],
    ['defgaaa', 520, 307, null, null, 0.1, '40,000'],
    ['', null, null, 221, 113, 0.1, '1,000'],
    ['', null, null, null, null, null, null],
    ['defgaaa', 520, 307, null, null, 0.1, '40,000'],
    ['', null, null, 221, 113, 0.1, '1,000'],
    ['', null, null, null, null, null, null],
    ['defgaaa', 520, 307, null, null, 0.1, '40,000'],
    ['', null, null, 221, 113, 0.1, '1,000'],
    ['', null, null, null, null, null, null],
    ['defgaaa', 520, 307, null, null, 0.1, '40,000'],
    ['', null, null, 221, 113, 0.1, '1,000'],
    ['', null, null, null, null, null, null],
    ['defgaaa', 520, 307, null, null, 0.1, '40,000'],
    ['', null, null, 221, 113, 0.1, '1,000'],
  ]
  renderChartIccNyuko('chart_icc_nyuko', data)
}
