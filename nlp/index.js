const { NlpManager } = require('node-nlp');
const fs = require('fs');
const path = require('path');

const nlpManager = new NlpManager({ languages: ['es'] });

const addDocumentsAndAnswers = (doc, ans) => {
  doc.forEach(d => {
    nlpManager.addDocument('es', d.input, d.output);
  });

  ans.forEach(a => {
    nlpManager.addAnswer('es', a.label, a.answer);
  });
};

const loadDocumentsAndAnswers = (folderPath) => {
  const files = fs.readdirSync(folderPath);

  files.forEach(file => {
    const filePath = path.join(folderPath, file);
    const { documents, answers } = require(filePath);
    addDocumentsAndAnswers(documents, answers);
  });
};

loadDocumentsAndAnswers(__dirname + '/intents');
nlpManager.train();

module.exports = nlpManager;