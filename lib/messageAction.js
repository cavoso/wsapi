class messageAction{
  construct(type){
    this.type = type;
    this.button = "";
    this.buttons = [];
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
  }
  
  addSection(){
  }
}