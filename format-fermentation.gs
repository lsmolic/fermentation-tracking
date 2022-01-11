var STARTING_ROW = 3

function test(){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Mini Brite Tests')
Logger.log(sheet.getSheetName())
   var range = sheet.getRange('AA8')
   cellMatchMarker(sheet, 27, 'P', '#FF2400')
}

function ResizeColumns(sheet, customRange){
  var activeSheet = sheet || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  var lastColumn = activeSheet.getLastColumn();
  var range = customRange || activeSheet.getRange(2,1,1,lastColumn);
  var values = range.getValues();
  var c = 1
Logger.log(activeSheet.getSheetName())
  values.forEach(function(row) {
    row.forEach(function(col) {
      if(['°C','L°','H°'].indexOf(col) > -1){
        activeSheet.setColumnWidth(c, 31);
      }
      if(['Step','SMV','BMD','Brix','Acid','ABV'].indexOf(col) > -1){
        activeSheet.setColumnWidth(c, 31);
      }
      if(['B'].indexOf(col) > -1){
        activeSheet.setColumnWidth(c, 28);
      }
      if(col == ''){
        activeSheet.setColumnWidth(c, 17);
      }
      c++
    })
  })
}

function cellMatchMarker(activeFermentationSheet, columnIndex, textContains, color) {
  var columnName = columnToLetter(columnIndex)
  var lastRow = activeFermentationSheet.getLastRow();
  var rangeName= columnName+STARTING_ROW+":"+columnName+lastRow
  var range = activeFermentationSheet.getRange(rangeName)
    var conditionalFormatRules = activeFermentationSheet.getConditionalFormatRules();
    conditionalFormatRules.push(SpreadsheetApp.newConditionalFormatRule()
     .whenTextContains(textContains)
      .setRanges([range])
      .setBackground(color)
      .build());
    activeFermentationSheet.setConditionalFormatRules(conditionalFormatRules);
}

function cellGreaterThanMarker(activeFermentationSheet, columnIndex, value, color) {
  var columnName = columnToLetter(columnIndex)
  var lastRow = activeFermentationSheet.getLastRow();
  var rangeName= columnName+STARTING_ROW+":"+columnName+lastRow
  var range = activeFermentationSheet.getRange(rangeName)
    var conditionalFormatRules = activeFermentationSheet.getConditionalFormatRules();
    conditionalFormatRules.push(SpreadsheetApp.newConditionalFormatRule()
     .whenNumberGreaterThanOrEqualTo(value)
      .setRanges([range])
      .setBackground(color)
      .build());
    activeFermentationSheet.setConditionalFormatRules(conditionalFormatRules);
}

function cellLessThanMarker(activeFermentationSheet, columnIndex, value, color) {
  var columnName = columnToLetter(columnIndex)
  var lastRow = activeFermentationSheet.getLastRow();
  var rangeName= columnName+STARTING_ROW+":"+columnName+lastRow
  var range = activeFermentationSheet.getRange(rangeName)
    var conditionalFormatRules = activeFermentationSheet.getConditionalFormatRules();
    conditionalFormatRules.push(SpreadsheetApp.newConditionalFormatRule()
     .whenNumberLessThanOrEqualTo(value)
      .setRanges([range])
      .setBackground(color)
      .build());
    activeFermentationSheet.setConditionalFormatRules(conditionalFormatRules);
}

function FormatAll() {
  var spreadSheet = getFermentationSheet()
  var allSheets = getFermentationSheet().getSheets()
  allSheets.forEach(function(sheet){
    var name = sheet.getSheetName()
    spreadSheet.toast('Begin formatting: '+ name);
    FormatCurrent(sheet)
    spreadSheet.toast('Finished formatting: '+ name);
  })
}

function clearConditionalFormatRulesForRange(sheet, range){
  var existingRules = sheet.getConditionalFormatRules();
  var removedRules = [];
  for (let index = 0; index < existingRules.length; index++) {
    let ranges = existingRules[index].getRanges();
    for (let j = 0; j < ranges.length; j++) {
      if (rangeIntersect(range, ranges[j])) {
          removedRules.push(existingRules[index]);
      }
    }
  }

  for (var i = removedRules.length - 1; i >= 0; i--){
    existingRules.splice(removedRules[i], 1);
  }

  var newRules = [] //skipping the logic to create new rules
  var allRules = existingRules.concat(newRules);
  //clear all rules first and then add again
  sheet.clearConditionalFormatRules(); 
  sheet.setConditionalFormatRules(allRules);
}


function FormatCurrent(currentSheet, customRange) {
  // var sheet = getFermentationSheet()
  var activeSheet = currentSheet || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  // sheet.toast(activeSheet.getSheetName());
  var lastColumn = activeSheet.getLastColumn();
  //TODO: dynamically determine the first column to cycle through. Shouldn't depent on 
  var range = customRange || activeSheet.getRange(2,1,1,lastColumn);
  var values = range.getValues();
  var r = 1
  var c = 1
  if(!customRange){
    activeSheet.clearConditionalFormatRules()
  }
  values.forEach(function(row) {
    row.forEach(function(col) {
      if (col == "°C") {
       tempRange(activeSheet, c)
      }
      if (col == "Acid"){
        cellGreaterThanMarker(activeSheet, c, 2.0, '#8E7CC3')
      }
      if (col == "SMV"){
        cellGreaterThanMarker(activeSheet, c, -20.0, '#8E7CC3')
      }
      if (col == "ABV"){
        cellGreaterThanMarker(activeSheet, c, 14.5, '#8E7CC3')
      }
      if (col == "Step"){
        cellMatchMarker(activeSheet, c, "PS", '#b7e1cd')
        cellMatchMarker(activeSheet, c, "PA", '#da97e5')
      }
      c++;
    });
    r++;
  });
  ResizeColumns(activeSheet, range)
}

var tempRange = function (activeFermentationSheet, columnIndex) {
  var sheet = getFermentationSheet()
  var columnName = columnToLetter(columnIndex)
  var rangeName= columnName+STARTING_ROW+":"+columnName
  var range = activeFermentationSheet.getRange(rangeName)
    sheet.getSelection().getNextDataRange(SpreadsheetApp.Direction.NEXT).activate();
    var conditionalFormatRules = activeFermentationSheet.getConditionalFormatRules();
    conditionalFormatRules.push(SpreadsheetApp.newConditionalFormatRule()
      .setRanges([range])
      .setGradientMaxpointWithValue('#FF2400', SpreadsheetApp.InterpolationType.NUMBER, "24")
      .setGradientMinpointWithValue('#FFFFFF', SpreadsheetApp.InterpolationType.NUMBER, "0")
      .build());
    activeFermentationSheet.setConditionalFormatRules(conditionalFormatRules);
};

// less efficient, but worth keeping around incase it becomes useful later
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
    var conditionalFormatRules = activeFermentationSheet.getConditionalFormatRules();
    conditionalFormatRules.push(SpreadsheetApp.newConditionalFormatRule()
      .setRanges([matchedRange])
      .setGradientMaxpoint(color)
      .setGradientMinpoint(color)
      .build());
    activeFermentationSheet.setConditionalFormatRules(conditionalFormatRules);
  }
}