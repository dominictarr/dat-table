
var tape = require('tape')
var Table = require('../')
var fs = require('fs')
var path = require('path')

tape('add rows', function (t) {

  var table = Table(['foo', 'bar', 'baz'])
  table.addRow([1, 2, 3]).addRow([3, 2, 6]).addRow([0, 1, 4])
  console.log(table.toJSON())
  t.deepEqual(
    table.toJSON(), [
      [{name: 'foo'}, {name: 'bar'}, {name: 'baz'}],
      [1, 2, 3],
      [3, 2, 6],
      [0, 1, 4]
    ])

  t.deepEqual(
    table.sortBy(2).toJSON(), [
      [{name: 'foo'}, {name: 'bar'}, {name: 'baz'}],
      [1, 2, 3],
      [0, 1, 4],
      [3, 2, 6],
    ])

  t.deepEqual(
    table.sortBy(1).toJSON(), [
      [{name: 'foo'}, {name: 'bar'}, {name: 'baz'}],
      [0, 1, 4],
      [1, 2, 3],
      [3, 2, 6],
    ])

  t.end()
})

//reduce a column, or every column.
tape('reduce', function (t) {
  var table = Table(['foo', 'bar', 'baz'])
  table.addRow([1, 2, 3]).addRow([3, 2, 6]).addRow([0, 1, 4])

  var sum = function (sum, item) {
    return (sum || 0) + item
  }

  var sum0 = table.reduce(0, sum)
  t.equal(sum0, 4)

  var sumRow = table.reduce(sum)
  t.deepEqual(sumRow, [4, 5, 13])
  console.log(table.toString())
  t.end()
})

tape('parse units', function (t) {
  var table = Table(['time (s)', 'length (m)', 'weight (kg)'])
  t.equal(table.units(0), 's')
  t.equal(table.units(1), 'm')
  t.equal(table.units(2), 'kg')

  t.deepEqual(table.header(), [
    {name: 'time',   units: 's'},
    {name: 'length', units: 'm'},
    {name: 'weight', units: 'kg'}
  ])

  t.equal('time (s), length (m), weight (kg)', table.toCSV())

  t.deepEqual(table.toJSON(), Table.createTable(table.toCSV()).toJSON())

  t.end()
})

tape('parse csv', function (t) {
  var tableCSV = Table.createTable(fs.readFileSync(path.join(__dirname, 'data.csv'), 'utf8'))
  var tableJSON = Table.createTable(require('./data.json'))

  console.log(tableCSV.toCSV())
  t.equal(tableCSV.toCSV(), tableJSON.toCSV())


  var a = tableCSV.toCSV().split('\n')
  var b = tableJSON.toCSV().split('\n')

  a.forEach(function (e, i) {
    t.equal(e, b[i])
  })

  t.deepEqual(tableCSV.toJSON(), tableJSON.toJSON())

  t.end()
})

tape('display numbers nicely', function (t) {

  var table = Table.createTable([
    [{name: 'type'}    , {name: 'numbers'}],
    ['small integer'   , 1],
    ['big integer'     , 200010210],
    ['decimal'         , 0.000001],
    ['big exponent'    , 19.4123e20],
    ['tiny exponent'   , 1.2313e-41],
    ['+ big exponent'  , -19.4123e20],
    ['- tiny exponent' , -1.2313e-41],
    ['largish decimal' , 12240.123],
    ['zero'            ,     0],
    ['Infinity'        , Infinity],
    ['-Infinity'       , -Infinity],
    ['not a number'    , NaN],

  ])

  var string
    = 'type           , numbers\n'
    + 'small integer  ,         1\n'
    + 'big integer    , 200010210\n'
    + 'decimal        ,         0.000001\n'
    + 'big exponent   ,   1.94123e+21\n'
    + 'tiny exponent  ,    1.2313e-41\n'
    + '+ big exponent ,  -1.94123e+21\n'
    + '- tiny exponent,   -1.2313e-41\n'
    + 'largish decimal,     12240.123\n'
    + 'zero           ,         0\n'
    + 'Infinity       , Infinity\n'
    + '-Infinity      , -Infinity\n'
    + 'not a number   , NaN'

  console.log(table.toCSV())
  console.log(JSON.stringify(table.toCSV()))
  t.equal(table.toCSV(), string)
  t.end()
})
