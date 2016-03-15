var google = google || {}
var visual

google.setOnLoadCallback(function () {
  visual = google.visualization
  drawChartScatter()
  drawChartColumn()
})

function drawChartScatter () {
  var data = visual.arrayToDataTable([
        ['日付', '収率'],
        [1, 20],
        [2, 30],
        [3, 40],
        [4, 50],
        [5, 60],
        [6, 70]
  ])
  var options = {
    title: '検反収率',
    colors: ['#FF0000'],
    pointShape: 'diamond',
    pointSize: '15',
    hAxis: {
      title: '日付', format: '#.##',
      titleTextStyle: { bold: true, italic: false },
      minValue: 0, maxValue: 31, gridlines: {count: 32}
    },
    vAxis: {
      title: '検反収率（％）',
      titleTextStyle: { bold: true, italic: false },
      minValue: 0, maxValue: 100, gridlines: {count: 5}
    },
    legend: 'none'
  }

  var chart = new visual.ScatterChart(document.getElementById('chart_scatter'))
  chart.draw(data, options)
}

function drawChartColumn () {
  var data = visual.arrayToDataTable([
        ['x', '計画量', '実績合計'],
        ['11111111111', 1, 4],
        ['22222222222', 5, 4],
        ['33333333333', 8, 4],
        ['44444444444', 1, 4],
        ['55555555555', 5, 4],
        ['66666666666', 8, 4],
        ['77777777777', 1, 4],
        ['88888888888', 5, 4],
        ['99999999999', 8, 4],
        ['00000000000', 1, 4],
        ['aaaaaaaaaaa', 5, 4],
        ['bbbbbbbbbbb', 8, 4],
        ['ccccccccccc', 1, 4],
        ['ddddddddddd', 5, 4],
        ['eeeeeeeeeee', 8, 4]
  ])
  var options = {
    legend: {position: 'top'},
    vAxis: {title: '入庫量'}
  }

  var chart = new visual.ColumnChart(document.getElementById('chart_column'))
  chart.draw(data, options)
}
