const exec = require('child_process').exec
const SPACE = ' '

exec('ps aux | grep node', (err, stdout, stderr) => {
  if (err !== null) {
    return console.log(`exec error: ${err}`)
  }
  var data = stdout.toString().split('\n')
  data.forEach((log) => {
    if (log.endsWith('./bin/www')) {
      var pid = getSvrPid(log)
      exec(`kill -9 ${pid}`, (err, stdout, stderr) => {
        if (err !== null) {
          return console.log(`exec error: ${err}`)
        }
        console.log(`killed process: ${stdout}`)
      })
    }
  })
})

function getSvrPid (log) {
  var pid = -1
  for (var i = 0; i < log.length; i++) {
    if (pid === -1) { // skip username
      if (log[i] === SPACE) pid = 0
    } else if (pid === 0) { // skip space
      if (log[i] !== SPACE) pid = log[i]
    } else {
      if (log[i] === SPACE) break
      pid += log[i]
    }
  }
  return pid
}
