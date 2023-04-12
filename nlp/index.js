const { NlpManager } = require('node-nlp');
const saludo = require('./saludo');
const despedida = require('./despedida');


const nlpManager = new NlpManager({ languages: ['es'] });

const addDocumentsAndAnswers = (doc, ans) => {
  doc.forEach(d => {
    nlpManager.addDocument('es', d.input, d.output);
  });

  ans.forEach(a => {
    nlpManager.addAnswer('es', a.label, a.answer);
  });
};

addDocumentsAndAnswers(saludo.documents, saludo.answers);
addDocumentsAndAnswers(despedida.documents, despedida.answers);


nlpManager.train();

module.exports = nlpManager;
