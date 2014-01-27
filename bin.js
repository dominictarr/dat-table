#! /usr/bin/env node

var opts = require('minimist')(process.argv.slice(2))
var path = require('path')
var Table = require('./')
var data = ''

var json = opts.json
var join = opts.join || opts.j
var filter = opts.columns || opts.c
var slice = opts.slice || opts.s

if(filter) {
  if('string' !== typeof filter)
    error('--columns COLS\n'
        + '# COLS must be comma separated column numbers to keep. 0,1,4')
  filter = filter.split(/,\s*/).map(Number)
}

if(slice) {
  if('string' !== typeof slice)
    error('--slice START,LENGTH')
  slice = slice.split(/,\s*/).map(Number)
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

function mutate (table) {
  console.error(slice, filter)
  if(slice)  table = table.slice.apply(table, slice)
  if(filter) table = table.filterColumns(filter)
  return table
}

if(!process.stdin.isTTY) {
  if(join)
    error('cannot join stdin, pass in filenames')
  process.stdin.on('data', function (d) { data += d })
  .on('end', function () {
    data = data.trim()
    dump(mutate(Table.createTable(data)))
  })
} else {
  var fs = require('fs')

  var table = Table.join(opts._.map(function (filename) {
    var data = fs.readFileSync(filename, 'utf8')
    var name = path.basename(filename).replace(/\.\w+$/,'')
    return mutate(Table.createTable(data, {name: name}))
  }))

  dump(table)
}

