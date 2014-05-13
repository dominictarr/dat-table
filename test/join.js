var tape = require('tape')

//join two tables into one table.
//join on a specific column (by default, the 0th column)
//and produce a new table.
//each table must have a name, which becomes part of the column name too.

var Table = require('../')

var expected =
[ [ { name: 'key', units: 'int' },
    { name: 'fibs.value', units: 'int' },
    { name: 'primes.value', units: 'int' },
    { name: 'squares.value', units: 'int' } ],
  [ 1, 1, 2, 1 ],
  [ 2, 1, 3, 4 ],
  [ 3, 2, 5, 9 ],
  [ 4, 3, 7, 16 ],
  [ 5, 5, 11, 25 ],
  [ 6, 8, 13, 36 ],
  [ 7, 13, 17, 49 ] ]


var a = [
  [ { name: 'key', units: 'int'},
            { name: 'value', units: 'int'}],
  [      1,      1],
  [      2,      1],
  [      3,      2],
  [      4,      3],
  [      5,      5],
  [      6,      8],
  [      7,     13]
]

var b = [
  [ { name: 'key', units: 'int'},
            { name: 'value', units: 'int'}],
  [      1,      2],
  [      2,      3],
  [      3,      5],
  [      4,      7],
  [      5,     11],
  [      6,     13],
  [      7,     17]
]

var c = [
  [ { name: 'key', units: 'int'},
            { name: 'value', units: 'int'}],
  [      1,      1],
  [      2,      4],
  [      3,      9],
  [      4,     16],
  [      5,     25],
  [      6,     36],
  [      7,     49]
]

tape('test join', function (t) {

  var A = Table.createTable(a, {name: 'fibs'})
  var B = Table.createTable(b, {name: 'primes'})
  var C = Table.createTable(c, {name: 'squares'})
  var actual = Table.join([A, B, C])
  console.log(actual.toCSV())
  t.deepEqual(actual.toJSON(), expected)
  t.end()
})

var expected2 =
[ [ { name: 'value', units: 'int' },
    { name: 'fibs.key', units: 'int' },
    { name: 'primes.key', units: 'int' },
    { name: 'squares.key', units: 'int' } ],
  [ 1, 1, 2, 1 ],
  [ 2, 1, 3, 4 ],
  [ 3, 2, 5, 9 ],
  [ 4, 3, 7, 16 ],
  [ 5, 5, 11, 25 ],
  [ 6, 8, 13, 36 ],
  [ 7, 13, 17, 49 ] ]


tape('join with columns specified', function (t) {
  var A = Table.createTable(a, {name: 'fibs'})
  var B = Table.createTable(b, {name: 'primes'})
  var C = Table.createTable(c, {name: 'squares'})

  var tables = [A, B, C].map(function (table) {
    return table.map(function (row) {
      return [row.pop(), row.shift()]
    })
  })
  var actual = Table.join(tables, [1, 1, 1])
  console.log(actual.toCSV())
  t.deepEqual(actual.toJSON(), expected2)
  t.end()

})
