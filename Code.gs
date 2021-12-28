// function onOpen() {
//   // Get the spreadsheet's user-interface object.
//   var ui = SpreadsheetApp.getUi();

//   // Create and add a named menu and its items to the menu bar.
//   ui.createMenu('Wetlands')
//    .addItem('Re-Format', 'formatting')
//   .addToUi();
// }

/* #######################

  THIS MIGHT BE MUCH EASIER TO BUILD A DATATABLE from scratch and then just add it all as a range

// fill an array with all possible values from 0.0 to 22.0
// iterate through each range and fill that 


########################## */

function helloWorld(){
  var graphSheet = SpreadsheetApp.getActive().getSheetByName('A/B Graph')
  graphSheet.clearContents()
  var abvValues = Array.from({length: 21/0.1}, (_, i) => (0.0 + (i * 0.1)).toFixed(1));
  var abvColumnValues = [["ABV"], ...abvValues.map( a => [a])]
  

  var selectedColumns = [['FV - Filtered!D3:D','FV - Filtered!H3:H'],['FV - Filtered!T3:T','FV - Filtered!X3:X']]
  // make a massive array of all values
  var brewRanges = []
  selectedColumns.forEach(function(rangeListName){
    Logger.log(rangeListName)
    var sheetName = rangeListName[0].split("!")[0]
    var ranges = SpreadsheetApp.getActive().getSheetByName(sheetName).getRangeList(rangeListName).getRanges()
    var rangeValues = []
    ranges.forEach(function (rg){
      rangeValues.push(rg.getValues())
    })
    brewRanges.push(rangeValues)
  })

  

  var data = Array.from({length: abvColumnValues.length}).map(x => Array.from({length: 0}))
  var headers = []
  brewRanges.forEach(function(brewRange, index){
    
    var numberOfColumns = brewRange[0].length
    data.map(x => x.push('')) // initialize the column
    var previousIndex = null
    var previousValue = null
    for(var i = 0; i < numberOfColumns; i++){
      // every loop fillin in the spots
      var baume = brewRange[0][i][0]
      // Logger.log(baume)
      if(isFloat(baume)){
        
        var columnIndex = parseInt(brewRange[1][i]/0.1)
        var columnValue = baume.toFixed(1)
        if(columnIndex){
          data[columnIndex][index] = columnValue



          if(previousIndex && previousValue){
            Logger.log(columnIndex+ " - " +columnValue+ " - " + previousIndex + " - " + previousValue)
            var step = parseFloat((columnValue - previousValue) / (columnIndex - previousIndex)).toFixed(2)
            var startValue = parseFloat(previousValue) + parseFloat(step)
              Logger.log(startValue)
            for(var p = previousIndex + 1; p < columnIndex; p++){
              data[p][index] = startValue
              startValue =  (parseFloat(startValue) + parseFloat(step)).toFixed(2)
            }
          }
          previousIndex = columnIndex
          previousValue = columnValue

        }
      }
    }
      
    headers.push("Brew"+index)
  })

  data.unshift(headers)
    Logger.log(data)



  var numberOfColumns = data[0].length
  var numberOfRows = data.length
  var lastColumnLetters = columnToLetter(numberOfColumns + 1) // add one for the starting column
  var rangeName = "B1:"+lastColumnLetters+numberOfRows
  
  // Logger.log("numberOfColumns: " + numberOfColumns)
  // Logger.log("numberOfRows: " + numberOfRows)
  // Logger.log("lastColumnLetters: " + lastColumnLetters)
  // Logger.log("rangeName: " + rangeName)

  var abvRange = graphSheet.getRange("A1:A211")

  // Logger.log(abvColumnValues)
  abvRange.setValues(abvColumnValues)
  var range = graphSheet.getRange(rangeName)
  // Logger.log(range.getValues())
  range.setValues(data);

  var hAxisOptions = {
    gridlines: {
      count: 12
    }
  };

  var charts = graphSheet.getCharts()
  graphSheet.removeChart(charts[0])
  chart = graphSheet.newChart().setChartType(Charts.ChartType.LINE)
    .setOption("useFirstColumnAsDomain", true)
    .addRange(abvRange)
    .addRange(range)
    .setTransposeRowsAndColumns(false)
    .setPosition(3, 3, 0, 0)
    .setOption('hAxis', hAxisOptions)
    .setNumHeaders(1)
    .setOption('title', 'A/B Line')
    .setOption("vAxes", {0: {title: "SMV"}})
    .setOption("hAxis", {title: "ABV",})
    .setOption("legend", {position: "top"})
    .build()


    graphSheet.insertChart(chart) 
}

function formatting() {
  var tempRange = function (columnIndex) {

    var sheet = SpreadsheetApp.getActiveSpreadsheet()
    var columnName = columnToLetter(columnIndex)
    var rangeName= columnName+"3"+":"+columnName
    var range = SpreadsheetApp.getActiveSheet().getRange(rangeName)
      sheet.getSelection().getNextDataRange(SpreadsheetApp.Direction.NEXT).activate();
      conditionalFormatRules = sheet.getActiveSheet().getConditionalFormatRules();
      conditionalFormatRules.push(SpreadsheetApp.newConditionalFormatRule()
        .setRanges([range])
        .setGradientMaxpoint('#FF2400')
        .setGradientMinpoint('#FFFFFF')
        .build());
      sheet.getActiveSheet().setConditionalFormatRules(conditionalFormatRules);
  };

  var thresholdMarker = function (columnIndex, threshold, ascending=false) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet()
    var columnName = columnToLetter(columnIndex)
    var lastRow = sheet.getLastRow();
    
    // Iterate through rows in the column and find number that crosses threshold

    var rangeName= columnName+"3"+":"+columnName+lastRow
    var range = SpreadsheetApp.getActiveSheet().getRange(rangeName)
    var values = range.getValues()
    var previousValue = null
    var matchedRow = null
    var matchedRowIndex = null
    var r = 3 // first row that matters

    values.forEach(function(row) {
      if ( 
        (matchedRow == null 
        && row != null 
        && row != "" 
        && ( ( ascending == false && row <= threshold   ) || (ascending && row >= threshold  ) ) 
        && ( ( ascending == false && previousValue >= threshold  ) || (ascending && previousValue <= threshold ) ) 
        ) || 
        ( matchedRow == null 
        && row != null 
        && row != "" 
        && ( ( ascending == false && row <= threshold   ) || (ascending && row >= threshold  ) )  
        && ((ascending == false && previousValue >= "") || (ascending && previousValue <= "" ))
        ))
        {
          matchedRow = row
          matchedRowIndex = r
      }
      previousValue = row
      r++
    })
    

    if(matchedRow != null){
      var matchedRangeName= columnName+matchedRowIndex
      var matchedRange = SpreadsheetApp.getActiveSheet().getRange(matchedRangeName)
      sheet.getSelection().getNextDataRange(SpreadsheetApp.Direction.NEXT).activate();
      conditionalFormatRules = sheet.getActiveSheet().getConditionalFormatRules();
      conditionalFormatRules.push(SpreadsheetApp.newConditionalFormatRule()
        .setRanges([matchedRange])
        .setGradientMaxpoint('yellow')
        .setGradientMinpoint('yellow')
        .build());
      sheet.getActiveSheet().setConditionalFormatRules(conditionalFormatRules);
    }
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet()
  var lastColumn = sheet.getLastColumn();
  var range = sheet.getActiveSheet().getRange(2,1,1,lastColumn+1);
  var values = range.getValues();
  var r = 1
  var c = 1

  SpreadsheetApp.getActiveSheet().clearConditionalFormatRules();
  values.forEach(function(row) {
    row.forEach(function(col) {
      if (col == "°C") {
       tempRange(c)
      }
      if (col == "B"){
        thresholdMarker( c, 2.0)
      }
      if (col == "Acid"){
        thresholdMarker( c, 2.0)
      }
      if (col == "ABV"){
        thresholdMarker( c, 14.5, true)
      }
      c++;
    });
    r++;
  });
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