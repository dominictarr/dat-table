#! /usr/bin/env node

var opts = require('minimist')(process.argv.slice(2))
var path = require('path')
var Table = require('./')
var data = ''

var json = opts.json
var join = opts.join || opts.j
var filter = opts.columns || opts.c
var slice = opts.slice || opts.s

var columns_help = '  --columns COLS\n' +
  '    # COLS must be comma separated column numbers to keep. eg, 0,1,4'
var slice_help = 
  '  --slice START,LENGTH\n' +
  '    # slice rows, from start to start+length'
var join_help = 
  '  [files...] --join {names,...}?\n' +
  '    # join multiple files into one table by the first column\n' +
  '    # if names are provided, they will used in output, instead of filenames'

if(filter) {
  if('string' !== typeof filter)
    error(columns_help)
  filter = filter.split(/,\s*/).map(Number)
}

if(slice) {
  if('string' !== typeof slice)
    error()
  slice = slice.split(/,\s*/).map(Number)
}

if(opts.help || (process.stdin.isTTY && opts._.length === 0)) {
  console.error('dat-table [files...] --{join,columns,slice,json,help}')
  console.error(join_help)
  console.error(columns_help)
  console.error(slice_help)
  console.error('  --json\n    #output as json format')
  console.error('  --help\n    #display this help message')
  process.exit(0)
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

  var names = opts.join != true ? join.split(',').map(function (s) { return s.trim() }) : []
  var table = Table.join(opts._.map(function (filename, i) {
    var data = fs.readFileSync(filename, 'utf8')
    return mutate(Table.createTable(data, {name: names[i] || path.basename(filename)}))
  }))

  dump(table)
}

