module.exports = async function evento(eventData, data) {
  console.log(JSON.stringify(data, null, 2));
  console.log(JSON.stringify(data.wa_id, null, 2));
};