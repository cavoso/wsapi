const { NlpManager } = require('node-nlp');
const db = require('../models');

const nlpManager = new NlpManager({ languages: ['es'] });

const loadDocumentsAndAnswers = async () => {
  try {
    const intents = await db.Intent.findAll();
    for (const intent of intents) {
      if (intent.tipo === 'DOCUMENT') {
        nlpManager.addDocument(
          'es',
          intent.texto,
          intent.intent
        );
      } else if (intent.tipo === 'ANSWER') {
        nlpManager.addAnswer(
          'es',
          intent.intent,
          intent.texto
        );
      }
    }
    
    const entities = await db.Entity.findAll();
    entities.forEach(entity => {
      nlpManager.addNamedEntityText(entity.name, entity.value, 'es', entity.synonyms);
    });
    
  } catch (error) {
    console.error('Error al cargar los intents:', error);
  }
};

(async () => {
  // Cargar los intents de la base de datos
  await loadDocumentsAndAnswers();

  // Entrenar el modelo de NLP
  

  // Exportar el modelo de NLP
  
})();
nlpManager.train();
module.exports = nlpManager;