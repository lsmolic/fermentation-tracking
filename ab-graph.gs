function RebuildABGraph(){
  getRanges()
}

function getRanges(){
  // Determine 
  var sheet = getOverviewSheet().getSheetByName('Batch Summary')
  var lastColumn = sheet.getLastColumn();
  var headerValues = sheet.getRange(1,1,1,lastColumn+1).getValues()
  var batchNameColumnIndex = headerValues[0].findIndex((value) => value == 'EKOS') + 1
  var checkBoxColumnIndex = headerValues[0].findIndex((value) => value == 'A/B') + 1
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
  var columnsToFind = ['B', 'ABV']
  
  var fermentationKeyedObject = setupFermentationKeyedObject(selectedFermentationNames, columnsToFind)
  
  abGraph(selectedFermentationNames, fermentationKeyedObject)
}

function setupFermentationKeyedObject(selectedFermentationNames, columnsToFind){
  /*
  BUILDING:

  {
    WU0009  = {
                B=12.0, ABV=16.0, sheetName=FV - Unfiltered
              }, 
    WF0004  = {
                B=67.0, ABV=71.0, sheetName=FV - Filtered
              }, 
    WF0011  = {
                B=11.0, ABV=15.0, sheetName=FV - Filtered
              }, 
    WF0008  = {  
                B=35.0, ABV=39.0, sheetName=FV - Filtered
              }
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
    // Logger.log(topRanges)
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

function abGraph(selectedFermentationNames, fermentationKeyedObject){
  var graphSheet = getGraphSheet().getSheetByName('A/B')
  graphSheet.clearContents()
  var abvValues = Array.from({length: 21/0.1}, (_, i) => (0.0 + (i * 0.1)).toFixed(1));
  var abvColumnValues = [["ABV"], ...abvValues.map( a => [a])]
  
  
  var selectedColumns = []
  selectedFermentationNames.forEach(name => {
    selectedColumns.push(fermentationKeyedObject[name]['ranges'])
  })

  var brewRanges = []
  selectedColumns.forEach(function(rangeListName){
    var sheetName = rangeListName[0].split("!")[0]
    var ranges = getFermentationSheet().getSheetByName(sheetName).getRangeList(rangeListName).getRanges()
    var rangeValues = []
    ranges.forEach(function (rg){
      rangeValues.push(rg.getValues())
    })
    brewRanges.push(rangeValues)

  // Logger.log(rangeValues)
  })

  var data = Array.from({length: abvColumnValues.length}).map(x => Array.from({length: 0}))
  var headers = []

  /* Iterate over the columns combos provided 
    [
      // brewRange 0
      [   
        [[0.0],[0.1],[0.2],[0.3]],  
        [[1.0],[2.0],[3.0],[4.0]]    
      ],
      // brewRange 1
      [ 
        [[0.0],[0.1],[0.2],[0.3]],  
        [[1.0],[2.0],[3.0],[4.0]]
      ]
    ]
  */
  addStandardSmvRanges(brewRanges, selectedFermentationNames)
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
            var step = parseFloat((columnValue - previousValue) / (columnIndex - previousIndex)).toFixed(2)
            var startValue = parseFloat(previousValue) + parseFloat(step)
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
      
    headers.push(selectedFermentationNames[index])
  })


  // add the headers array to the beginning of the top array for column headers
  data.unshift(headers)
  var numberOfColumns = data[0].length
  var numberOfRows = data.length
  var lastColumnLetters = columnToLetter(numberOfColumns + 1) // add one for the starting column
  var rangeName = "B1:"+lastColumnLetters+numberOfRows
  var abvRange = graphSheet.getRange("A1:A211")
  abvRange.setValues(abvColumnValues)
  var range = graphSheet.getRange(rangeName)
  range.setValues(data);

  var hAxisOptions = {
    gridlines: {
      count: 12,
    }
  };

  var charts = graphSheet.getCharts()
  if(charts.length > 0){
    graphSheet.removeChart(charts[0])
  }

  let trendlinesOptions = {}
  for(var i=0; i<brewRanges.length; i++){
    trendlinesOptions[i] = {type: 'linear',}
  }
  
  chart = graphSheet.newChart().setChartType(Charts.ChartType.LINE)
    .setOption("useFirstColumnAsDomain", true)
    .addRange(abvRange)
    .addRange(range)
    .setTransposeRowsAndColumns(false)
    .setNumHeaders(1)
    .setPosition(1, 1, 0, 0)
    .setOption('width', 1000)
    .setOption('height', 700)
    .setOption('title', 'A/B Line')
    .setOption("vAxes", {0: {title: "°B"}})
    .setOption('hAxis', hAxisOptions)
    .setOption("hAxis", {title: "ABV"})
    .setOption("legend", {position: "top"})
    .setOption("trendlines", trendlinesOptions)
    .build()

    graphSheet.insertChart(chart) 
}

function addStandardSmvRanges(brewRanges, selectedFermentationNames){
  var ranges = standardSmvRanges();
  Object.keys(ranges).forEach((key) => {
    selectedFermentationNames.push(key)
  })
  Object.keys(ranges).forEach((key) => {
    brewRanges.push(ranges[key])
  })
}

