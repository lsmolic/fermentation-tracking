var STARTING_ROW = 3

function formatAll() {
  var spreadSheet = getFermentationSheet()
  var allSheets = getFermentationSheet().getSheets()
  allSheets.forEach(function(sheet){
    var name = sheet.getSheetName()
    spreadSheet.toast('Begin formatting: '+ name);
    formatCurrent(sheet)
    spreadSheet.toast('Finished formatting: '+ name);
  })
}

function formatCurrent(currentSheet) {
  var sheet = getFermentationSheet()
  var activeSheet = currentSheet || sheet.getActiveSheet()
  var lastColumn = sheet.getLastColumn();
  //TODO: dynamically determine the first column to cycle through. Shouldn't depent on 
  var range = activeSheet.getRange(2,1,1,lastColumn+1);
  var values = range.getValues();
  var r = 1
  var c = 1

 activeSheet.clearConditionalFormatRules();
  values.forEach(function(row) {
    row.forEach(function(col) {
      if (col == "°C") {
       tempRange(activeSheet, c)
      }
      if (col == "Acid"){
        thresholdMarker(activeSheet, c, 2.0, '#8E7CC3')
      }
      if (col == "SMV"){
        thresholdMarker(activeSheet, c, -20.0, '#8E7CC3', true)
      }
      if (col == "ABV"){
        thresholdMarker(activeSheet, c, 14.5, '#8E7CC3', true)
      }
      c++;
    });
    r++;
  });
}

var tempRange = function (activeFermentationSheet, columnIndex) {
  var sheet = getFermentationSheet()
  var columnName = columnToLetter(columnIndex)
  var rangeName= columnName+STARTING_ROW+":"+columnName
  var range = activeFermentationSheet.getRange(rangeName)
    sheet.getSelection().getNextDataRange(SpreadsheetApp.Direction.NEXT).activate();
    conditionalFormatRules = activeFermentationSheet.getConditionalFormatRules();
    conditionalFormatRules.push(SpreadsheetApp.newConditionalFormatRule()
      .setRanges([range])
      .setGradientMaxpoint('#FF2400')
      .setGradientMinpoint('#FFFFFF')
      .build());
    activeFermentationSheet.setConditionalFormatRules(conditionalFormatRules);
};

var thresholdMarker = function (activeFermentationSheet, columnIndex, threshold, color, ascending=false) {
  var sheet = getFermentationSheet()
  var columnName = columnToLetter(columnIndex)
  var lastRow = sheet.getLastRow();
  
  // Iterate through rows in the column and find number that crosses threshold

  var r = STARTING_ROW // first row that matters
  var rangeName= columnName+r+":"+columnName+lastRow
  var range = activeFermentationSheet.getRange(rangeName)
  var values = range.getValues()
  var previousValue = null
  var matchedRow = null
  var matchedRowIndex = null

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
    var matchedRange = activeFermentationSheet.getRange(matchedRangeName)
    sheet.getSelection().getNextDataRange(SpreadsheetApp.Direction.NEXT).activate();
    conditionalFormatRules = activeFermentationSheet.getConditionalFormatRules();
    conditionalFormatRules.push(SpreadsheetApp.newConditionalFormatRule()
      .setRanges([matchedRange])
      .setGradientMaxpoint(color)
      .setGradientMinpoint(color)
      .build());
    activeFermentationSheet.setConditionalFormatRules(conditionalFormatRules);
  }
}