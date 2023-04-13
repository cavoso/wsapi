const db = require('../../models');

const Documents = [];
const Answers = [];

async function LoadDepartamentos(){
  const departamentos = await db.Departamento.findAll();
      for (const departamento of departamentos) {
        Documents.push({
          input: departamento.nombre,
          output: 'Departamento' 
        });
      }
}

LoadDepartamentos();

module.exports = {
  documents: Documents,
  answers: Answers,
};