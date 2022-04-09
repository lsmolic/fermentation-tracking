function formatSheetName(name){
  if(name.includes("WF")){
    return 'FV - Filtered'
  }else if(name.includes("WS")){
    return 'FV - Sparkling'
  }else if(name.includes("WU")){
    return 'FV - Unfiltered'
  }else if(name.includes("MT")){
    return 'Mini Brite Tests'
  }else if(name.includes("TB")){
    return 'FV - Taproom Base'
  }else{
    return null
  }
}

function columnToLetter(column)
{
  var temp, letter = '';
  while (column > 0)
  {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

function letterToColumn(letter)
{
  var column = 0, length = letter.length;
  for (var i = 0; i < length; i++)
  {
    column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
  }
  return column;
}

function isFloat(n){
    return Number(n) === n && n % 1 !== 0;
}

function getAllIndexes(array, query, func) {
    var indexes = [], i;
    for(i = 0; i < array.length; i++)
        if (array[i] === query){
          if(func){
            indexes.push(func(i))
          } else{
            indexes.push(i);
          }  

        }

    return indexes;
}

// usage:  array.filter(onlyUnique)
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function findIndexFromStartPosition(array, stringToMatch, startPosition) {
  var index = array.slice(startPosition).findIndex(m => m == stringToMatch);
  return index === -1 ? -1 : index + startPosition;
}

function Coordinates (range) {
  var self = this
  ;
  self.x1 = range.getColumn();
  self.y1 = range.getRow();
  self.x2 = range.getLastColumn();
  self.y2 = range.getLastRow();
}

function overlaps (a, b, c, d) {
  return (a >= c && a <= d) || (b >= c && b <= d) || (c >= a && c <= b) || (d >= a && d <= b);
}

function rangeIntersect (r1, r2) {

  r1 = new Coordinates (r1);
  r2 = new Coordinates (r2);

  return (overlaps(r1.x1, r1.x2, r2.x1, r2.x2) && overlaps(r1.y1, r1.y2, r2.y1, r2.y2));
}

function col2row(column) {
  return [column.map(function(row) {return row[0];})];
} 

function row2col(row) {
  return row[0].map(function(elem) {return [elem];});
}