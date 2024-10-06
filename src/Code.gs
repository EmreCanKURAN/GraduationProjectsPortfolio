function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}

function getAvailableYears() {
  const manager = new GraduationProjectManager("YOUR_FOLDER_ID_HERE");
  return manager.getAvailableYears();
}

function getProjectsForYear(year, start, limit) {
  const manager = new GraduationProjectManager("YOUR_FOLDER_ID_HERE");
  return manager.getProjectsForYear(year, start, limit);
}
