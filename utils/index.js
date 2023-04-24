const WSProc = require('./whatsapp-json-processor');
const moment = require('moment');
const urlRegex = require('url-regex');
const regex = urlRegex({ exact: false });

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function TsToDateString(timestamp){
  let date = new Date(parseInt(timestamp) * 1000);
  let mysqlDatetimeString = date.toISOString().slice(0, 19).replace('T', ' ');
  return mysqlDatetimeString;
}

module.exports = {
  WSProc: WSProc,
  moment: moment,
  urlRegex: urlRegex,
  regex: regex,
  delay: delay,
  TsToDateString: TsToDateString
};