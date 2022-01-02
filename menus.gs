function onOpen() {
  // Get the spreadsheet's user-interface object.
  var ui = SpreadsheetApp.getUi();

  // Create and add a named menu and its items to the menu bar.
  ui.createMenu('Wetlands')
   .addItem('Rebuild A/B Graph', 'RebuildABGraph')
  .addToUi();
}