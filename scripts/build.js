const fs = require('fs')
const uglify = require('uglify-js')

var sources = ['../public/js/src/chart.js', '../public/js/src/event.js']
var result = uglify.minify(sources)
console.log(result)

var outputFile = fs.createWriteStream('../public/js/chart.min.js')
outputFile.write(result)
