#! /usr/bin/env node

var opts = require('minimist')(process.argv.slice(2), {string: ['filter']})
var path = require('path')
var Table = require('./')
var data = ''

var json = opts.json
var join = opts.join || opts.j
var filter = opts.columns || opts.c

if(filter) {
  if('string' !== typeof filter)
    error('--columns COLS\n'
        + '# COLS must be comma separated column numbers to keep. 0,1,4')
  filter = filter.split(/,\s*/).map(Number)
}

function error (message) {
  console.error(message)
  process.exit(1)
}

function dump(table) {
 if(json)
    console.log(JSON.stringify(table, null, 2))
  else
    console.log(''+table)
}

function applyFilter(table) {
  if(!filter) return table
  return table.filterColumns(filter)
}

if(!process.stdin.isTTY) {
  if(join)
    error('cannot join stdin, pass in filenames')
  process.stdin.on('data', function (d) { data += d })
  .on('end', function () {
    data = data.trim()
    dump(applyFilter(Table.createTable(data)))
  })
} else {
  var fs = require('fs')
  var table = Table.join(opts._.map(function (name) {
    return applyFilter(Table.createTable(
      fs.readFileSync(name, 'utf8'),
      {name: path.basename(name)}
    ))
  }))
  dump(table)
}
