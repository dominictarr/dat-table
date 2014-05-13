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

function Table (headers, opts) {
  if(!(this instanceof Table)) return new Table(headers, opts)
  this._rows = []
  this._columns = []
  this._headers = headers.map(parseUnits)
  opts = this._opts = opts || {}
  if(opts.name)
    this.name = opts.name

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

t.headers = t.header

module.exports.createTable = function (data, opts) {
  //first row is headers, unless opts says otherwise (todo)
  //array of arrays

  //parse CSV. naive, does not handle quotes yet.

  if(data[0] == '{' || data[0] == '[') {
    try {
      data = JSON.parse(data)
    } catch (err) {
      data = data.split('\n').map(JSON.parse)
    }
    if(Array.isArray(data)) {
      var headers = []
      data.forEach(function (row) {
        for(var k in row)
          if(!~headers.indexOf(k)) headers.push(k)
      })
      var t = new Table(headers)
      data.forEach(function (e) {
        t.addRow(headers.map(function (key) {
          return e[key]
        }))
      })
      return t
    } else
      throw new Error('json {} not supported')

  }

  if(isString(data))
    data = data
    .split('\n')
    .filter(function (e) { return !!e})
    .map(function (e) {
      return e.split(',').map(function (e) {
        var value = e.trim()
        if(value === '') return value
        return isNaN(value) ? value : parseFloat(value)
      })
    })

  var t = new Table(data[0], opts)

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
    for(var i = 0; i < l; i++) {
      if(iter(this._rows[i], i, this) != null) return
    }
  else
    for(var i = 0; i < l; i++)
      if(this._rows[i].hasOwnProperty(col)) {
        if(iter(this._rows[i][col], i, this) != null ) return
      }
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

t.toHTML = function () {
  return "<table>\n" +
  [this.headers().map(function (row) {
    return "<th>" + row.name + "</th>"
  }).join(' ')].concat(this._rows.map(function (row) {
    return row.map(function (value) { return "<td>" + value + "</td>" }).join(' ')
  })).map(function (html) { return "  <tr>" + html + "</tr>" })
  .join('\n') + "\n</table>"
}

t.find = function (col, test) {
  var value = null
  function each (v, k, o) {
    value = test(v, k, o)
    return value
  }

  if('function' == typeof col)
    test = col, this.each(each)
  else
    test.each(col, test)
  return value
}


t.map = function (map) {
  var t2 = Table(this.headers(), this._opts)
  this.each(function (v, k, t) {
    t2.addRow(map(v, k, t))
  })
  return t2
}

t.filter = function (test) {
  var t2 = Table(this.headers(), this._opts)
  this.each(function (v, k, t) {
    if(test(v, k, t))
      t2.addRow(v)
  })
  return t2
}

t.slice = function () {
  var t2 = Table(this.headers(), this._opts)
  var rows = this.toJSON().slice(1)
  rows = [].slice.apply(rows, arguments)
  rows.forEach(function (row) {
    t2.addRow(row)
  })
  return t2
}

t.filterColumns = function (cols) {
  if(!Array.isArray(cols))
    throw new Error('filterColumns(cols) expects an array of column numbers')

  var t = this.map(function (row) {
    return cols.map(function (i) {
      return row[i]
    })
  })
  
  t._headers = cols.map(function (i) {
      return t._headers[i]
    })
  return t
}

t.unique = function (col) {
  col = col || 0
  var seen = {}
  return this.filter(function (v) {
    if(seen[v[col]]) return false
    return seen[v[col]] = true
  })
}

Table.join = function (tabs, cols) {
  if(!cols)
    cols = tabs.map(function (e) { return 0 })

  if(tabs.length == 1) return tables[0]
  if(tabs.length > 2)
    return Table.join(
      [tabs[0], Table.join(tabs.slice(1), cols.slice(1))],
      [cols[0], 0]
    )

  //only need to unique() the first, because rows that don't match will be dropped.
  tabs[0]
    .sort(cols[0])
    .unique(cols[0])

  tabs[1]
    .sort(cols[1])

  function name(headers, name) {
    if(!name) return headers
    return headers.map(function (v) {
      return {
        name: name + '.' + v.name,
        units: v.units
      }
    })
  }

  function merge(a, b, i, j) {
    return [a[i]].concat(strip(a, i)).concat(strip(b, j))
  }

  function strip(array, index) {
    array = array.slice()
    array.splice(index, 1)
    return array
  }

  var headers = merge(
    name(tabs[0].headers(), tabs[0].name),
    name(tabs[1].headers(), tabs[1].name),
    cols[0], cols[1]
  )

  //don't give the shared column a special name.
  headers[0].name = tabs[0].headers()[cols[0]].name

  var t2 = Table(headers)
  tabs[0].each(function (row) {
    var row2 = tabs[1].find(function (v) {
      if(v[cols[1]] == row[cols[0]]) return v
    })
    if(row2)
      t2.addRow(merge(row, row2, cols[0], cols[1]))
  })
  return t2
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

