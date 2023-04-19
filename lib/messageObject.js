class MessageObject{
  construct(title, type){
    this.title = title;
    this.type = type;
    this.rows = [];
    this.product_items = [];
  }
  
  addRow(title, id, description = ""){
    let row = {
      title: title,
      ID: id
    }
    if(description != ""){
      row.description = description;
    }
    this.rows.push(row);
  }
  
  addProduct(productId){
    this.product_items = [];
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