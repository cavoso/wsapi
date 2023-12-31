class messageAction{
  constructor(type, catalog_id="", product_retailer_id=""){
    this.type = type;
    this.button = "";
    this.buttons = [];
    this.sections = [];
    this.catalog_id = catalog_id;
    this.product_retailer_id = product_retailer_id;
  }
  
  addButton(title, id = ""){
    if(this.type === "list"){
      this.button = title;
    }
    if(this.type === "button"){
      this.buttons.push({
        type: "reply",
        reply: {
          id: id,
          title: title
        }
      });
    }
    return this;
  }
  
  addSection(section){
    this.sections.push(section);
    return this;
  }
  
  toJSON(){
    let Json = {};
    if(this.type === 'button'){
      Json.buttons = this.buttons;
    }
    if(this.type === 'list'){
      Json.button = this.button;
      Json.sections = this.sections;
    }
    if(this.type === 'product'){
      Json.catalog_id = this.catalog_id;
      Json.product_retailer_id = this.product_retailer_id;
    }
    if(this.type === 'product_list'){
      Json.product_items = this.product_items;
    }
    return Json;
  }
}


module.exports = messageAction;