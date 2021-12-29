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
        .setGradientMaxpoint('#8E7CC3')
        .setGradientMinpoint('#8E7CC3')
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
      if (col == "Acid"){
        thresholdMarker( c, 2.0)
      }
      if (col == "SMV"){
        thresholdMarker( c, -20.0, true)
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