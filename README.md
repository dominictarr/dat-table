# dat-table

A data structure for tables of data.

a table of data, as in a CSV, with methods for operating on the data,
as well as formatting as csv.


Idea: could probably refactor this in such a way that it's possible to work with
either arrays or with streams.

## example
``` js
var fs = require('fs')
var Table = require('dat-table')

var table = Table.createTable(fs.readFileSync('data.csv', 'utf8'))


function sum (acc, i) {
  return (acc || 0) + i
}

//sum each column.
var sums = table.reduce(sum)

//sum just one column.
var sum3rdColum = table.reduce(3, sum)
```

## toCSV

convert to csv, and pad for maximum readability.
strings are left aligned, and numbers are aligned to
the decimal. A column of integers will be right aligned.
exponential numbers are alligned to the `e` in the exponent,
and weird "numbers", like Infinity and NaN are aligned like strings.

The table will have left padding, but will not have trailing whitespace.
```
type           , numbers
small integer  ,         1
big integer    , 200010210
decimal        ,         0.000001
big exponent   ,   1.94123e+21
tiny exponent  ,    1.2313e-41
+ big exponent ,  -1.94123e+21
- tiny exponent,   -1.2313e-41
largish decimal,     12240.123
zero           ,         0
Infinity       , Infinity
-Infinity      , -Infinity
not a number   , NaN
```

## Units

each column can have units.
This will be very useful for graphing.

## API

### Table (headers)

create a table with the given headers.
headers must be an array of objects or strings.

``` js
var table = new Table(['foo', 'bar', 'baz'])

// or specify units like this

var table = new Table([
      {name: 'Time': units: 'S'},
      {name: 'Length', units: 'm'},
      {name: 'Weight', units: 'kg'}
    ])

//or as strings
var table = new Table(['Time (S)', 'Length (m)', 'Weight (kg)'])
//TODO: convert between different units.
```

### Table#getRow(i)

return the `i`th row (as an array)

### Table#addRow(array)

append a row.

### Table#units (i?)

return the units of the `i`th column,
if `i` is not provided, return an array of all the units.

### Table#header (i?)

return the ith header or the array of headers.

### Table#reduce(i?, reducer, initial)

just like `Array#reduce`, except that is applied to the table.
if `i` is provided only the `i`th column is reduced.
if `i` is not provided, each row is reduced, and then an array of values is returned.

### Table#each (i?, iter)

iterate over the rows, or if `i` is provided,
iterate over the values in the `i`th column.


### Table#sort (i?, comparator?)

Sort the table by the given column and comparator.
If a column is not provided, will sort by the first column.

### Table#toJSON()

convert to `json`.

### Table#toCSV()

convert to `csv`

## ideas

This was basically just refactoring parts out of my `line-graph` module.
some things that might be useful:

* convert between different units (should be separate module)
* group by: return another table that is just a subset of this table?
* emit events when cells change?
* listen on ranges of cells/columns?
* address columns by name?
* reorder columns?
* computed columns.

## License

MIT
