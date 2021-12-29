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