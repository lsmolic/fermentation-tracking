var DAILY_COLUMNS = ['°C','B','BMD','Brix','Acid','ABV']

function RebuildDailyGraph(){
  getDailyRanges()
}

function getDailyRanges(){
  // Determine 
  var sheet = getOverviewSheet().getSheetByName('Batch Summary')
  var lastColumn = sheet.getLastColumn();
  var headerValues = sheet.getRange(1,1,1,lastColumn+1).getValues()
  var batchNameColumnIndex = headerValues[0].findIndex((value) => value == 'EKOS') + 1
  var checkBoxColumnIndex = headerValues[0].findIndex((value) => value == 'Daily') + 1
  var batchColumnNameA1 = columnToLetter(batchNameColumnIndex)
  var checkBoxColumnNameA1 = columnToLetter(checkBoxColumnIndex)
  var rangeList = sheet
    .getRangeList([batchColumnNameA1+'2:'+batchColumnNameA1, checkBoxColumnNameA1+'2:'+checkBoxColumnNameA1])
    .getRanges()
  var rangeValues = []

  rangeList.forEach(function (rg){
    rangeValues.push(rg.getValues().map(value => value[0]))
  })
  var fermentationNames = rangeValues[0]
  var checkBoxes = rangeValues[1]
  var fermentationIndicies = getAllIndexes(checkBoxes, true)
  var selectedFermentationNames = fermentationIndicies.map(i => fermentationNames[i])
  if(selectedFermentationNames.length > 1){
    SpreadsheetApp.getActive().toast('You can only select one Daily fermentation to graph!');
    return
  }
  var columnsToFind = DAILY_COLUMNS
  
  var fermentationKeyedObject = setupFermentationKeyedObject(selectedFermentationNames, columnsToFind)
  
  dailyGraph(selectedFermentationNames, fermentationKeyedObject)
}

// selectedFermentationNames ["MT0008"]
// fermentationKeyedObject { MT0008: { "°C": (column number), ranges: ["Mini Brite Tests!M3:M", ... ]}}
function dailyGraph(selectedFermentationNames, fermentationKeyedObject){
  var graphSheet = getGraphSheet().getSheetByName('Daily')
  graphSheet.clearContents()
  var dayValues = Array.from({length: 43/1}, (_, i) => (1 + (i * 1)).toFixed(1));
  var dayColumnValues = [["Day"], ...dayValues.map( a => [a])]

  // represents the A1 names of Fermentation columns we want to graph
  // [["Mini Brite Tests!M3:M", "Mini Brite Tests!P3:P", ...], ["Mini Brite Tests!AD3:AD", "Mini Brite Tests!AF3:AF", ...]]
  var selectedColumns = []
  selectedFermentationNames.forEach(name => {
    selectedColumns.push(fermentationKeyedObject[name]['ranges'])
  })

  var brewRanges = []
  selectedColumns.forEach(function(rangeListName){
    var sheetName = rangeListName[0].split("!")[0]
    var ranges = getFermentationSheet().getSheetByName(sheetName).getRangeList(rangeListName).getRanges()
    var rangeValues = []
    rangeValues.push(dayValues.map( a => [a]))
    ranges.forEach(function (rg){
      rangeValues.push(rg.getValues())
    })
    brewRanges.push(rangeValues)
  })

  // Need to select FIRST (because only one) selectedFermentationNames,
  // iterate through brewRanges[index of first fermentation name] to create array of values
  // then transpose that array and add it as the first rows in the Sheet
  
  var data = Array.from({length: dayColumnValues.length}).map(x => Array.from({length: 0}))
  var lastDayRow = startingRow+numberOfRows - 2
  var numberOfColumns = data[0].length
  var numberOfRows = data.length
  
  var startingRow = DAILY_COLUMNS.length + 2
  var lastDayRow = startingRow+numberOfRows - 2
  var dayRangeName = "A"+startingRow+":A"+parseInt(lastDayRow+1)
  var dayRange = graphSheet.getRange(dayRangeName)
  dayRange.setValues(dayColumnValues)

  /* Iterate over the columns combos provided 
    [
      // brewRange 0
      [   
        [[0.0],[0.1],[0.2],[0.3]],  
        [[1.0],[2.0],[3.0],[4.0]]    
      ]
    ]

  */

  var rangesToAdd = []

  var brewRange = brewRanges[0]
  // clear the data for each new brewrange
  var numberOfColumns = brewRange.length
  // iterate over °B, SMV, etc
  for(var c = 1; c < numberOfColumns; c++){
    var previousIndex = null
    var previousValue = null
    data = Array.from({length: numberOfRows.length}).map(x => Array.from({length: 0}))
    // var numberOfRows = brewRange[c].length
    // Iterate over the values in the column with are themselves Arrays with one value 
    for(var r=0; r < numberOfRows-1; r++){
      // every loop fillin in the spots
      var value = brewRange[c][r][0]
      if(Number(value) == value){
        var columnValue = value
        if(value){
          data[r] = [value]
          if(previousIndex && previousValue){
            var step = parseFloat((columnValue - previousValue) / (r - previousIndex))
            var startValue = parseFloat(previousValue) + parseFloat(step)
            for(var p = previousIndex + 1; p < r; p++){
              data[p] = [startValue]
              startValue = (parseFloat(startValue) + parseFloat(step)).toFixed(2)
            }
          }
          previousIndex = r
          previousValue = value
        }else{
          data[r] = ['']
        }
      }
    }
    var completeData = data.slice()
    completeData.unshift([DAILY_COLUMNS[c-1]])
    var rangeName = columnToLetter(c+1)+startingRow+":"+columnToLetter(c+1)+parseInt(completeData.length+startingRow-1)
    rangesToAdd.push([rangeName, completeData])
  }
    
  rangesToAdd.forEach( rangeToAdd=> {
    var rangeName = rangeToAdd[0]
    Logger.log(rangeName)
    var range = graphSheet.getRange(rangeName)
    range.setValues(rangeToAdd[1])
  })

//////////////////////////////////
// TRANSPOSE VALUES TO TOP OF SHEET 
  var transposedDayValues = col2row(dayColumnValues)
  var transposedDayRangeName = "A1:"+columnToLetter(lastDayRow-(DAILY_COLUMNS.length))+"1"
  var transposedDayRange = graphSheet.getRange(transposedDayRangeName)
  transposedDayRange.setValues(transposedDayValues)

  var selectedFermentationName = selectedFermentationNames[0]
  for(i=0; i<DAILY_COLUMNS.length; i++){
    var dailyColumnRangeName = fermentationKeyedObject[selectedFermentationName]['ranges'][i]
    var values = getFermentationSheet().getRange(dailyColumnRangeName).getValues()
    values.unshift([DAILY_COLUMNS[i]])
    var transposedDayValues = col2row(values)
    var row = i+2
    var transposedDayRangeName = "A"+row+":"+columnToLetter(lastDayRow-(DAILY_COLUMNS.length))+row
    Logger.log(transposedDayRangeName)
    var transposedDayRange = graphSheet.getRange(transposedDayRangeName)
    transposedDayRange.setValues(transposedDayValues)
  }
  // END OF TRANSPOSING
  ///////////////////////


  var charts = graphSheet.getCharts()
  if(charts.length > 0){
    graphSheet.removeChart(charts[0])
  }

  chart = graphSheet.newChart().setChartType(Charts.ChartType.LINE)
    .setOption("useFirstColumnAsDomain", true)
    .addRange(dayRange)
    .addRange(graphSheet.getRange(rangesToAdd[1][0]))
    .addRange(graphSheet.getRange(rangesToAdd[3][0]))
    .addRange(graphSheet.getRange(rangesToAdd[4][0]))
    .addRange(graphSheet.getRange(rangesToAdd[5][0]))
    .addRange(graphSheet.getRange(rangesToAdd[2][0]))
    .setTransposeRowsAndColumns(false)
    .setNumHeaders(1)
    .setPosition(DAILY_COLUMNS.length+2, 1, 0, 0)
    .setOption('width', 1000)
    .setOption('height', 700)
    .setOption('hAxis', { 
        gridlines: {
          count: 40
      },
      minValue: 0,
      maxValue: 40
    })
    .setOption('title', 'BMD Graph')
    .setOption('series', {
      1: {
        targetAxisIndex:0
      },
      2: {
        targetAxisIndex:0
      },
      3: {
        targetAxisIndex:0
      },
      4: {
        targetAxisIndex:1
      },
      5: {
        targetAxisIndex:0
      }
    })
    .setOption("vAxes",{
        0:{
            title: "B°, Brix, Acidity, ABV",
            gridlines: {
              count: 9
            },
            
            minValue: 0,
            maxValue: 20
          },
        1:{
            title: "BMD",
            gridlines: {
                count: 10
            },
            minValue: 0,
            maxValue: 100
          }
        } 
      )
    .setOption("hAxis", {
      title: "Brew Day",
    })
    .setOption("legend", {position: "top"})
    .build()

    graphSheet.insertChart(chart) 
}


function setupFermentationKeyedObject(selectedFermentationNames, columnsToFind){
  /*
  BUILDING:

  {
    WU0009  = {
                BMD=12.0, Day=1, sheetName=FV - Unfiltered
              }, 
  }
  */
  var formattedSheetNames = selectedFermentationNames
    .map(name => formatSheetName(name))
    .filter(e=>e) // remove nulls
  
  var fermentationKeyedObject = {}
  var uniqueSheetNames = formattedSheetNames.filter(onlyUnique)
  uniqueSheetNames.forEach( (name) => {
    var sheet = getFermentationSheet().getSheetByName(name)
    var lastColumn = sheet.getLastColumn();
    var topRanges = sheet.getRange(1,1,2,lastColumn+1).getValues()
    topRanges[0].forEach( (column, index) => {
      var selectedFermentationNameIndex = selectedFermentationNames.findIndex(name => name == column.trim())
      if(selectedFermentationNameIndex > -1){
        columnsToFind.forEach( c => {
          var fermentationName = selectedFermentationNames[selectedFermentationNameIndex]
          if(!fermentationKeyedObject[fermentationName]){
            fermentationKeyedObject[fermentationName] = {sheetName: name}
          }
          fermentationKeyedObject[fermentationName][c] = findIndexFromStartPosition(topRanges[1], c, index)
        })
      }
    })
  })

   selectedFermentationNames.forEach( (value, index) => {
    var rangeArray = []
    columnsToFind.forEach((column) => {
      var columnIndex = parseInt(fermentationKeyedObject[value][column])
      var columnLetter = columnToLetter(columnIndex + 1)
      rangeArray.push(fermentationKeyedObject[value]['sheetName']+"!"+columnLetter+"3:"+columnLetter)
    })
    fermentationKeyedObject[value]['ranges'] = rangeArray
  })
  
  return fermentationKeyedObject
}


function addStandardDayRanges(brewRanges, selectedFermentationNames){
  var ranges = standardDayRanges();
  Object.keys(ranges).forEach((key) => {
    selectedFermentationNames.push(key)
  })
  Object.keys(ranges).forEach((key) => {
    brewRanges.push(ranges[key])
  })
}