const { NlpManager  } = require('node-nlp');
const db = require('../models');
const urlRegex = require('url-regex');

const nlpManager = new NlpManager({ languages: ['es'] });

const loadDocumentsAndAnswers = async () => {
  try {
    const intents = await db.Intent.findAll();
    for (const intent of intents) {
      if (intent.tipo === 'DOCUMENT') {
        nlpManager.addDocument('es', intent.texto, intent.intent);
      } else if (intent.tipo === 'ANSWER') {
        nlpManager.addAnswer('es', intent.intent, intent.texto);
      }
    }
    let agentes = await db.Agent.findAll();
    for (const agente of agentes){
      nlpManager.addDocument('es', agente.city, "ciudad");
    }
    
    
    //intents manuales
    nlpManager.addDocument('es',"SI","verificacion");
    nlpManager.addDocument('es',"NO","verificacion");
    nlpManager.addDocument('es', 'omitir', 'omitir');
    nlpManager.addDocument('es', 'saltar', 'omitir');
    
    const entities = await db.Entity.findAll();
    entities.forEach(entity => {
      nlpManager.addNamedEntityText(entity.name, entity.value, 'es', entity.synonyms);
    });
    nlpManager.addRegexEntity('url', 'es', urlRegex({ exact: false }));
    
  } catch (error) {
    console.error('Error al cargar los intents:', error);
  }
};

(async () => {
  // Cargar los intents de la base de datos
  await loadDocumentsAndAnswers();

  // Entrenar el modelo de NLP
  await nlpManager.train();

  // Exportar el modelo de NLP
  nlpManager.save('model.nlp');
})();

module.exports = nlpManager;