function onOpen() {
  // Get the spreadsheet's user-interface object.
  var ui = SpreadsheetApp.getUi();
  
  
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet()
  Logger.log(spreadSheet.getId())
  
  if(spreadSheet.getId() == OVERVIEW_SHEET_ID){
    ui.createMenu('Wetlands')
      .addItem('Rebuild All Graphs', 'RebuildGraphs')
      .addItem('Rebuild A/B Graph', 'RebuildABGraph')
      .addItem('Rebuild BMD Graph', 'RebuildBMDGraph')
      .addItem('Rebuild Acidity Graph', 'RebuildAcidityGraph')
      .addItem('Rebuild Daily Graph', 'RebuildDailyGraph')
      .addToUi();
  }else if(spreadSheet.getId() == FERMENTATION_SHEET_ID){
    ui.createMenu('Wetlands')
      .addItem('Format Current Sheet', 'FormatCurrent')
      .addItem('Format All Sheets', 'FormatAll')
      .addItem('Rebuild All Graphs', 'RebuildGraphs')
      .addItem('Rebuild A/B Graph', 'RebuildABGraph')
      .addItem('Rebuild BMD Graph', 'RebuildBMDGraph')
      .addItem('Rebuild Acidity Graph', 'RebuildAcidityGraph')
      .addItem('Rebuild Daily Graph', 'RebuildDailyGraph')
      .addToUi();
  }else if(spreadSheet.getId() == GRAPH_SHEET_ID){
    ui.createMenu('Wetlands')
      .addItem('Rebuild All Graphs', 'RebuildGraphs')
      .addItem('Rebuild A/B Graph', 'RebuildABGraph')
      .addItem('Rebuild BMD Graph', 'RebuildBMDGraph')
      .addItem('Rebuild Acidity Graph', 'RebuildAcidityGraph')
      .addItem('Rebuild Daily Graph', 'RebuildDailyGraph')
      .addToUi();
  }
  
}

function RebuildGraphs(){
  RebuildABGraph()
  RebuildBMDGraph()
  RebuildAcidityGraph
  RebuildDailyGraph()
}