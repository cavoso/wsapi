const db = require("./Database");

async function GetTicket(waid){
  const tickets = await db.getRecords('Ticket', {
    filters: [{
      field: "waid",
      value: waid
    }]
  });
  
  let ticket;
  
  if(tickets.length > 0){
    ticket = tickets[0];
  }else{
    const newTicketData = {
      // Coloca los datos que quieras incluir en el nuevo ticket
      // Puedes utilizar el valor de contacto.wa_id para asignarlo a la propiedad correspondiente
    };

    ticket = await db.createRecord("Ticket", newTicketData);
  }
  
  return ticket;
}