class MessageObject{
  constructor(title, type){
    this.title = title;
    this.type = type;
    this.rows = [];
    this.product_items = [];
  }
  
  addRow(title, id, description = ""){
    let row = {
      title: title,
      id: id
    }
    if(description != ""){
      row.description = description;
    }
    this.rows.push(row);
    return this;
  }
  
  addProduct(productId){
    this.product_items.push({
      product_retailer_id:  productId
    });
    return this;
  }
  
  toJSON(){
    let Json = {
      title : this.title
    };
    if(this.type === 'list'){
      Json.rows = this.rows;
    }
    if(this.type === 'product_list'){
      Json.product_items = this.product_items;
    }
    return Json;
  }
}

module.exports = MessageObject;