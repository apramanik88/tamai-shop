// Google Apps Script – receives orders and appends them to the bound Google Sheet.
var HEADERS = ["time","order_id","name","phone","address","size","qty","unit_price","delivery_area","delivery_charge","total","note","status",
  "utm_source","utm_medium","utm_campaign","utm_content","utm_term","gclid","fbclid","event_id","page"];
var NOTIFY_EMAIL = ""; // optional: your email for new-order alerts

function doPost(e) {
  var o = JSON.parse(e.postData.contents);
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Orders") || SpreadsheetApp.getActiveSpreadsheet().insertSheet("Orders");
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  o.time = new Date(); o.status = "New";
  sh.appendRow(HEADERS.map(function (h) { var v = o[h]; return v === undefined ? "" : (h === "phone" ? "'" + v : v); }));
  if (NOTIFY_EMAIL) MailApp.sendEmail(NOTIFY_EMAIL, "New order " + o.order_id, o.name + " | " + o.phone + " | size " + o.size + " x" + o.qty + " | total " + o.total);
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
function doGet() { return ContentService.createTextOutput("OK"); }
