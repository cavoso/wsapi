const { NlpManager  } = require('node-nlp');
const db = require('../models');
const urlRegex = require('url-regex');
  const fs = require('fs');

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
    nlpManager.addDocument('es', 'menu', 'Menu');
    
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
  //elimina el modelo
  if (fs.existsSync("model.nlp")) {
    fs.unlinkSync("model.nlp");
    console.log("Se elimina el archivo");
  }
  // Cargar los intents de la base de datos
  await loadDocumentsAndAnswers();

  // Entrenar el modelo de NLP
  await nlpManager.train();

  // Exportar el modelo de NLP
  try {
    nlpManager.save('model.nlp');
    console.log('Modelo NLP guardado');
  } catch (error) {
    console.error('Error al guardar el modelo NLP:', error);
  }
  
  try {
    await nlpManager.load('model.nlp');
    console.log('Modelo NLP cargado');
  } catch (error) {
    console.error('Error al cargar el modelo NLP:', error);
  }
})();

module.exports = nlpManager;