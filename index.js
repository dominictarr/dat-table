module.exports = Table
var format = require('./format')

function isNumber (n) {
  return 'number' === typeof n
}

function isObject (o) {
  return o && 'object' === typeof o
}

function isString (s) {
  return 'string' === typeof s
}

//function isDecimal (e) {
//  return isNumber(e) ? (e % 1 !== 0) : false
//}
//
//function isExponent (e) {
//  return Math.abs(e) >= 1e21 || Math.abs(e) < 1e-6
//}
//

function parseUnits (header) {
  if(isObject(header)) return header
  var m = /^(.+)\s+\(([^\)]+)\)$/.exec(header.trim())
  if(!m) return {name: header.trim()}
  return {name: m[1].trim(), units: m[2]}
}

function Table (headers) {
  if(!(this instanceof Table)) return new Table(headers)
  this._rows = []
  this._columns = []
  this._headers = headers.map(parseUnits)

  var self = this
  this._headers.forEach(function (header, i) {
    self._columns[i] = new Column(self, i, header)
  })
}

var t = Table.prototype

t.getRow = function (row) {
  return this._rows[i]
}

t.addRow = function (array) {
  this._rows.push(array)
  return this
}

t.units = function (i) {
  if(isNumber(i))
    return this._headers[i].units
  return this._headers.map(function (e) { return e.units })
}

t.header = function (i) {
  if(isNumber(i))
    return this._headers[i]
  return this._headers.slice()

}

module.exports.createTable = function (data, opts) {
  //first row is headers, unless opts says otherwise (todo)
  //array of arrays

  //parse CSV. naive, does not handle quotes yet.
  if(isString(data))
    data = data
    .split('\n')
    .filter(function (e) { return !!e})
    .map(function (e) {
      return e.split(',').map(function (e) {
        var value = e.trim()
        return isNaN(value) ? value : parseFloat(value)
      })
    })

  var t = new Table(data[0])

  for(var i = 1; i < data.length; i++)
    t.addRow(data[i].map(function (e) {
      return isString(e) ? e.trim() : e
    }))

  return t
}

//okay, so what about operations like min and max?
//average or sum? something calculated across a column?

t.column = function (n) {
  if(!this._headers[n])
    throw new Error('table does not have column:' + n)
  return this._columns[n] = this._columns[n] || new Column(this, n)
}

t.reduce = function (col, reducer, initial) {
  if('function' == typeof col) {
    initial = reducer, reducer = col, col = null
    var a = []
    for(var i = 0; i < this.width(); i++)
      a[i] = this.reduce(i, reducer, initial)
    return a
  }
  var acc = initial || null
  for(var i = 0; i < this._rows.length; i++) {
    if(this._rows[i].hasOwnProperty(col))
      acc = reducer(acc, this._rows[i][col])
  }
  return acc
}

t.length = function () {
  return this._rows.length
}

t.width = function () {
  return this._columns.length
}
t.sort =
t.sortBy = function (col, comparator) {
  if('function' === typeof col)
    comparator = col, col = 0
  col = col || 0
  this._rows.sort(function (a, b) {
    var _a = a[col], _b = b[col]
    if(comparator) return comparator(_a, _b)
    return _a == _b ? 0 : _a < _b ? -1 : 1
  })
  return this
}
t.forEach =
t.each = function (col, iter) {
  if('function' === typeof col)
    iter = col, col = null
  var l = this.length()

  if(col == null)
    for(var i = 0; i < l; i++)
      iter(this._rows[i], i, this)
  else
    for(var i = 0; i < l; i++)
      if(this._rows[i].hasOwnProperty(col))
        iter(this._rows[i][col], i, this)
}

t.toJSON = function () {
  var a = []
  a.push(this._headers.slice())
  this.each(function (row) {
    a.push(row.slice())
  })
  return a
}

t.toCSV =
t.toString = function () {
  return format(this.toJSON())
}


var stats = require('./stats')

for(var k in stats)
  (function (k) {
    t[k] = function (i) {
      if(i == null)
        return this.reduce(stats[k])
      return this.reduce(i, stats[k])
    }
  })(k)

//this does nothing currently...
//but maybe it would be good to have something like this?
//so that you can pass columns to functions?
function Column (table, header, i) {
  this._table = table, this._header = header, this._i = i
}

