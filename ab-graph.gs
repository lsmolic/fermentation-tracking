function regenerateABGraph(){
  getRanges()
}

function getRanges(){
  var sheet = SpreadsheetApp
    .openById('1SKwVYrnLY35OwbARFKnx7OTl52Q1QMyWj4_DN6yjeWA')
    .getSheetByName('Batch Summary')
  
 var lastColumn = sheet.getLastColumn();
 var headerValues = sheet.getRange(1,1,1,lastColumn+1).getValues()
 var batchNameColumnIndex = headerValues[0].findIndex((value) => value == 'EKOS') + 1
 var checkBoxColumnIndex = headerValues[0].findIndex((value) => value == 'A/B') + 1
 var batchColumnNameA1 = columnToLetter(batchNameColumnIndex)
 var checkBoxColumnNameA1 = columnToLetter(checkBoxColumnIndex)

 var rangeList = SpreadsheetApp
    .openById('1SKwVYrnLY35OwbARFKnx7OTl52Q1QMyWj4_DN6yjeWA')
    .getSheetByName('Batch Summary')
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

  var formatSheetName = function(name){
    if(name.includes("WF")){
      return 'FV - Filtered'
    }else if(name.includes("WS")){
      return 'FV - Sparkling'
    }else if(name.includes("WU")){
      return 'FV - Unfiltered'
    }else if(name.includes("MT")){
      return 'Mini Brite Tests'
    }else{
      return null
    }
  }

  var formattedSheetNames = selectedFermentationNames
    .map(name => formatSheetName(name))
    .filter(e=>e) // remove nulls

  var columnsToFind = ['B', 'ABV']

  var uniqueSheetNames = formattedSheetNames.filter(onlyUnique)
  // var sheetTopRanges = uniqueSheetNames.reduce((acc,curr)=> (acc[curr]={},acc),{}); // object with sheet name keys
  var fermentationKeyedObject = {}

  uniqueSheetNames.forEach( (name) => {
    Logger.log(name)
    var sheet =SpreadsheetApp.getActive().getSheetByName(name)
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

  Logger.log(selectedFermentationNames)
  
  
  selectedFermentationNames.forEach( (value, index) => {
    var rangeArray = []
    columnsToFind.forEach((column) => {
      var columnIndex = parseInt(fermentationKeyedObject[value][column])
      var columnLetter = columnToLetter(columnIndex + 1)
      rangeArray.push(fermentationKeyedObject[value]['sheetName']+"!"+columnLetter+"3:"+columnLetter)
    })
    fermentationKeyedObject[value]['ranges'] = rangeArray
  })
  
  Logger.log(fermentationKeyedObject)
  abGraph(selectedFermentationNames, fermentationKeyedObject)
}

function abGraph(selectedFermentationNames, fermentationKeyedObject){
  var graphSheet = SpreadsheetApp.getActive().getSheetByName('A/B Graph')
  graphSheet.clearContents()
  var abvValues = Array.from({length: 21/0.1}, (_, i) => (0.0 + (i * 0.1)).toFixed(1));
  var abvColumnValues = [["ABV"], ...abvValues.map( a => [a])]
  
  var selectedColumns = []
  selectedFermentationNames.forEach(name => {
    selectedColumns.push(fermentationKeyedObject[name]['ranges'])
  })

  // var selectedColumns = [['FV - Filtered!T3:T','FV - Filtered!X3:X'],['FV - Filtered!D3:D','FV - Filtered!H3:H']]
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
      
    headers.push(selectedFermentationNames[index])
  })
  // add the headers array to the beginning of the top array for column headers
  data.unshift(headers)


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
    .setOption("vAxes", {0: {title: "°B"}})
    .setOption("hAxis", {title: "ABV",})
    .setOption("legend", {position: "top"})
    .build()


    graphSheet.insertChart(chart) 
}
