var COLUMNS = ['°C','L°','H°','Step','SMV','B','BMD','Brix','Acid','ABV','']

function NewFermentation() {
  var spreadsheet = SpreadsheetApp.getActive()
  var activeSheet = spreadsheet.getActiveSheet()
  var allRules = activeSheet.getConditionalFormatRules();
  
  
  //Create new Columns
  spreadsheet.getRange('A1').activate();
  spreadsheet.getActiveSheet().insertColumnsAfter(spreadsheet.getActiveRange().getColumn(), 11);
  
  // SELECTED THE NEWLY CREATED COLUMNS because the indicies just shifted
  spreadsheet.getActiveRange().offset(0, 0, spreadsheet.getActiveRange().getNumRows(), 11).activate();
  
  spreadsheet.getRange('B1:K1').activate();
  spreadsheet.getRange('M1:V1').copyTo(spreadsheet.getActiveRange(), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);

  // Copy and paste the standard temperature column VALUES ONLY
  spreadsheet.getRange(copyToColumnLetter(0)+'2:'+copyToColumnLetter(0)).activate();
  spreadsheet.getRange(copyFromColumnLetter(0)+'2:'+copyFromColumnLetter(0)).copyTo(spreadsheet.getActiveRange(), SpreadsheetApp.CopyPasteType.PASTE_VALUES, false);

  // Copy and paste the remaining columns with FORMULAS ONLY
  spreadsheet.getRange(copyToColumnLetter(1)+'2:'+copyToColumnLetter(9)).activate();
  spreadsheet.getRange(copyFromColumnLetter(1)+'2:'+copyFromColumnLetter(9)).copyTo(spreadsheet.getActiveRange(), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);

  // Copy and paste the separator FORMAT ONLY
  spreadsheet.getRange(copyToColumnLetter(10)+'1:'+copyToColumnLetter(10)).activate();
  spreadsheet.getRange(copyFromColumnLetter(10)+'1:'+copyFromColumnLetter(10)).copyTo(spreadsheet.getActiveRange(), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);

  // Delete values from the previous fermentation
  spreadsheet.getRange('C3:F').activate();
  spreadsheet.getActiveRangeList().clear({contentsOnly: true, skipFilteredRows: true});
  spreadsheet.getRange('I3:K').activate();
  spreadsheet.getActiveRangeList().clear({contentsOnly: true, skipFilteredRows: true});

  // Setup the headers 
  var headersRange = spreadsheet.getRange('B2:L2')
  headersRange.activate();
  headersRange.setValues([COLUMNS])

  // make the divider black
  // spreadsheet.getRange('L:L').setBackground('black')

  // Delete the Fermentation Name/ID so we can fill it in
  spreadsheet.getRange('B1:K1').activate();
  spreadsheet.getActiveRangeList().clear({contentsOnly: true, skipFilteredRows: true});
  

  activeSheet = spreadsheet.getActiveSheet()
  let activeRange = activeSheet.getRange('A2:L2')
  ResizeColumns(activeSheet,activeRange)
  FormatCurrent(activeSheet,activeRange)
};

function copyFromColumnLetter(columnIndex){
  
  // SKIP 'A' + 1
  // actual array index
  // adjust for zero index + 1
  // pulling from the previous columns + length of array
  var index = 1+columnIndex+1+COLUMNS.length
  Logger.log(COLUMNS.length)
  return columnToLetter(index)
}

function copyToColumnLetter(columnIndex){
  
  // SKIP 'A' + 1
  // actual array index
  // adjust for zero index + 1
  // pulling from the previous columns + length of array
  var index = 1+columnIndex+1
  Logger.log(columnToLetter(index))
  return columnToLetter(index)
}