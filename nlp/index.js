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

const files = fs.readdirSync(__dirname).filter(file => {
  const ext = path.extname(file);
  return file !== 'index.js' && ext === '.js';
});

files.forEach(file => {
  const data = require(path.join(__dirname, file));
  addDocumentsAndAnswers(data.documents, data.answers);
});

nlpManager.train();

module.exports = nlpManager;
