module.exports = async function evento(eventData, data) {
  let wa_id = data.wa_id;
  console.log(JSON.stringify(data, null, 2));
  console.log(JSON.stringify(data.wa_id, null, 2));
};