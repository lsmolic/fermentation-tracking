function onOpen() {
  // Get the spreadsheet's user-interface object.
  var ui = SpreadsheetApp.getUi();
  
  ui.createMenu('Wetlands')
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet()
  
  if(spreadSheet.getId() == OVERVIEW_SHEET_ID){
    ui.addItem('Rebuild A/B Graph', 'RebuildABGraph')
  }else if(spreadSheet.getId() == FERMENTATION_SHEET_ID){
    ui.addItem('Format Current Sheet', 'FormatCurrent')
    ui.addItem('Format All Sheets', 'FormatAll')
  }else if(spreadSheet.getId() == GRAPH_SHEET_ID){
     ui.addItem('Rebuild A/B Graph', 'RebuildABGraph')
  }
  
  ui.addToUi();
  
}