var google = google || {}
var visual
var graphFuncMap = {
  chart_scatter: [buildChartScatterReqData, renderChartScatter],
  chart_column: [buildChartColumnReqData, renderChartColumn]
}

google.setOnLoadCallback(function () {
  visual = google.visualization

  loadGraphData('chart_scatter')
  loadGraphData('chart_column')

  setInterval(function () {
    console.log('Fetch New Data')
    loadGraphData('chart_scatter')
    loadGraphData('chart_column')
  }, 1000 * 60)
})

$(function () {
  $('#g_shuritu').on('click', function (e) {
    e.preventDefault()
    loadGraphData('chart_scatter')
  })

  $('#g_nk').on('click', function (e) {
    e.preventDefault()
    loadGraphData('chart_column')
  })
})

function loadGraphData (gEle) {
  var data = buildReqData(gEle)
  if (data == null) return console.error('build request data fail')
  $.ajax({
    url: '/graph',
    type: 'POST',
    data: data,
    success: function (result) {
      renderGraph(gEle, result)
    }
  })
}

function buildReqData (gEle) {
  if (graphFuncMap.hasOwnProperty(gEle)) {
    return graphFuncMap[gEle][0](gEle)
  } else {
    console.error('NO buildRequestData method for', gEle, 'element')
    alert('NO buildRequestData method for ' + gEle + ' element')
    return null
  }
}

function renderGraph (gEle, data) {
  if (graphFuncMap.hasOwnProperty(gEle)) {
    graphFuncMap[gEle][1](gEle, data)
  } else {
    console.error('NO render method for', gEle, 'element')
    alert('NO render method for ' + gEle + ' element')
  }
}

// chart_scatter
function buildChartScatterReqData (gEle) {
  var data = {
    type: 'shuritu',
    data: {
      shn_cd: '2922',
      jz_ymd_from: '2016/03/01',
      jz_ymd_to: '2016/03/14',
      pro_cd_0: ['0701', '0703']
    }
  }

  return data
}

function renderChartScatter (gEle, data) {
  data = data.map(function (arr) {
    arr[0] = parseInt(arr[0].split('/')[2], 10)
    return arr
  })
  var graphData = [['日付', '収率']].concat(data)
  graphData = visual.arrayToDataTable(graphData)

  var options = {
    title: '検反収率',
    colors: ['#FF0000'],
    pointShape: 'diamond',
    pointSize: '15',
    hAxis: {
      title: '日付',
      titleTextStyle: { bold: true, italic: false },
      gridlines: {count: data[data.length - 1][0] + 1}
    },
    vAxis: {
      title: '検反収率（％）',
      titleTextStyle: { bold: true, italic: false }
    },
    legend: 'none'
  }

  var chart = new visual.ScatterChart(document.getElementById(gEle))
  chart.draw(graphData, options)
  console.log('rendered graph:', gEle)
}

// chart_column
function buildChartColumnReqData (gEle) {
  var data = {
    type: 'nk',
    data: {
      shn_cd: '2922',
      nk_kbn: '1',
      nk_ymd_from: '2016/03/01',
      nk_ymd_to: '2016/03/14'
    }
  }

  return data
}

function renderChartColumn (gEle, data) {
  data = data.map(function (arr) {
    var rst = [arr[0], arr[2], arr[3]]
    return rst
  })
  var graphData = [['x', '計画量', '実績合計']].concat(data)
  graphData = visual.arrayToDataTable(graphData)
  var options = {
    legend: {position: 'top'},
    vAxis: {
      title: '入庫量（ｍ）',
      titleTextStyle: { bold: true, italic: false }
    }
  }

  var chart = new visual.ColumnChart(document.getElementById(gEle))
  chart.draw(graphData, options)
  console.log('rendered graph:', gEle)
}
