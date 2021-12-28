function abGraph(){
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
