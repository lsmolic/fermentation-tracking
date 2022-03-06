var GRAPH_SHEET_ID = '11e0KTXIhM4qaQKsblInodUUZWfi8V9lBTDEV7B56kLE'
var FERMENTATION_SHEET_ID = '1SGds0M_qhhR32kVkNj9a99AazparI57wY8rMl6xl88E'
var OVERVIEW_SHEET_ID = '1SKwVYrnLY35OwbARFKnx7OTl52Q1QMyWj4_DN6yjeWA'

function getGraphSheet() {
  return SpreadsheetApp.openById(GRAPH_SHEET_ID)
}

function getFermentationSheet() {
  return SpreadsheetApp.openById(FERMENTATION_SHEET_ID)
}

function getOverviewSheet() {
  return SpreadsheetApp.openById(OVERVIEW_SHEET_ID)
}
