const { NlpManager } = require('node-nlp');
const fs = require('fs');
const path = require('path');
const db = require('../models');

const nlpManager = new NlpManager({ languages: ['es'] });

// nlpManager.addDocument('es', d.input, d.output);
// nlpManager.addAnswer('es', a.label, a.answer);

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

const loadEntitys = (folderPath) => {
  const files = fs.readdirSync(folderPath);

  files.forEach(file => {
    const filePath = path.join(folderPath, file);
    const { entity, titulo } = require(filePath);
    nlpManager.addNamedEntityText(titulo, entity, 'es');
  });

};


loadDocumentsAndAnswers(__dirname + '/intents');
loadEntitys(__dirname + '/entitys');

nlpManager.addDocument('es', 'omitir', 'omitir');
nlpManager.addDocument('es', 'saltar', 'omitir');


nlpManager.train();

module.exports = nlpManager;