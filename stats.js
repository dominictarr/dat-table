

function isNumber (n) {
  return 'number' === typeof n
}

exports.stats = function (stat, e) {

  if(!isNumber(e))
    return stat

  if(stat == null)
    stat = {sum: e, count: 1, mean: e, min: e, max: e}
  else {
    stat.sum += e
    stat.count ++
    stat.min = Math.min(e, stat.min)
    stat.max = Math.max(e, stat.max)
    stat.range = stat.max - stat.min
    stat.mean = stat.sum / stat.count
    //I don't recall how to calculate stddev in a single pass...
    //look this up.
  }

  return stat
}

exports.sum = function (sum, e) {
  return (sum || 0) + e
}

exports.max = function (max, e) {
  if(!isNumber(e)) return max
  if(max == null) return e
  return Math.max(max, e)
}

exports.min = function (min, e) {
  if(!isNumber(e)) return min
  if(min == null) return e
  return Math.min(min, e)
}

exports.count = function (c, e) {
  return (c || 0) + 1
}

