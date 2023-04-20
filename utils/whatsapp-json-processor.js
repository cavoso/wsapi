const extractRelevantData = (data) => {
  let datos = data.entry.map(entry => {
    return entry.changes.map(change => {
      const { metadata, contacts, messages, statuses } = change.value;

      if (messages) {
        return {
          metadata,
          contacts,
          messages
        };
      } else if (statuses) {
        return {
          metadata,
          statuses
        };
      }
    });
  });
  return datos[0][0];
};

module.exports = extractRelevantData;
