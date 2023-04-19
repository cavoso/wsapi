class MessageObject{
  construct(title){
    this.title = title;
    this.rows = [];
    this.product_items = [];
  }
  
  addRow(title, id, description = ""){
    let row = {
      
    }
    this.rows.push();
  }
  
  toJSON(){
    let Json = {
      title : this.title
    };
    return JSON.stringify(Json);
  }
}

module.exports = {
  MessageObject
};