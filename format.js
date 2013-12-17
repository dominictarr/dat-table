var _spaces = '                                       ';

function isNumber (n) {
  return 'number' === typeof n
}

function isObject (o) {
  return o && 'object' === typeof o
}

function isString (s) {
  return 'string' === typeof s
}

function isDecimal (e) {
  return isNumber(e) ? (e % 1 !== 0) : false
}

function isExponent (e) {
  return isNumber(e) && !isWeird(e) && (Math.abs(e) >= 1e21 || Math.abs(e) < 1e-6 && e !== 0)
}

function isWeird (n) {
  return isNumber(n) && (n === Infinity || n === -Infinity || isNaN(n))
}


function spaces (n) {
  return _spaces.substring(0, n)
}

function pad (value, length) {
  var string = value.toString()
  var total = Math.max(length.total, length.fraction + length.whole)

  if(isNumber(value) && !isWeird(value)) {
    var whole
    if(isExponent(value)) {
      whole = string.indexOf('e')
    } else
      whole = Math.round(value).toString().length
    string = spaces(total - whole - length.fraction) + value
    return  string + spaces(total - string.length)
  }
  var padding = spaces(total - string.length)
  return string + padding
}


module.exports = function (array) {
  function headerToString (e) {
    return e.name + (e.units ? ' (' + e.units + ')' : '')
  }
  
  function reduceLengths (l, item) {
    if(!l) l = {whole: 0, total: 0, fraction: 0}
    var whole, fraction, total
    if(isNumber(item)) {
      if(isExponent(item)) {
        var str = item.toString()
        whole = str.indexOf('e')
        fraction = str.length - whole
        total = str.length
      } else if(isDecimal(item)) {
        var string = item.toString()
        whole = string.indexOf('.')
        fraction = string.substring(whole).length
        console.log(string, whole, fraction)
        total = string.length
      } else {
        total = whole = item.toString().length
        fraction = 0
      }
    } else {
      total = item.toString().length
      fraction = whole = 0
    }
    
    l.total = Math.max(l.total, total)
    l.whole = Math.max(l.whole, whole)
    l.fraction = Math.max(l.fraction, fraction)

    return l
  }

  var lengths = []
  array[0] = array[0].map(headerToString)
  var lengths = array.reduce(function (a, line) {
      line.forEach(function (v, i) {
        a[i] = reduceLengths(a[i], v)
      })
      return a
    }, [])

  return array.map(function (e, i) {
    return e.map(function (e, i) {
      return pad(e, lengths[i])
    }).join(', ').trimRight()
  }).join('\n')

}
