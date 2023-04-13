const { NlpManager } = require('node-nlp');
const fs = require('fs');
const path = require('path');
const db = require('../models');

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
async function LoadDepartamentos(){
  let Documents = [];
  const departamentos = await db.Departamento.findAll();
  for (const departamento of departamentos) {
    Documents.push({
      input: departamento.nombre,
      output: 'Departamento'
    });
  }
  addDocumentsAndAnswers(Documents, []);
}

loadDocumentsAndAnswers(__dirname + '/intents');
LoadDepartamentos();


nlpManager.train();

module.exports = nlpManager;