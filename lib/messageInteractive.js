class MessageInteractive{
  construct(type){
    this.type = type;
    this.header = null;
    this.body = null;
    this.footer = null;
    this.action = null;
  }
  
  addHeader(type, content){
    this.header.type = type;
    if(type === "text"){
      this.header.text = content;
    }else if(type === "document"){
      this.header.document = content;
    }else if(type === "image"){
      this.header.image = content;
    }else if(type === "video"){
      this.header.video = content;
    }
  }
  
  addBody(text){
    this.body.text = text;
  }
  
  addFooter(text){
    this.footer.text = text;
  }
  
  addAction(action){
    this.action = action;
  }
  
  toJson(){
    let Json = {
      type: this.type
    };
    
    if(this.header){
      Json.header = this.header;
    }
    if(this.body){
      Json.body = this.body;
    }
    if(this.footer){
      Json.footer = this.footer;
    }
    if(this.action){
      Json.action = this.action;
    }
    
    return JSON.stringify(Json);
  }
  
}

module.exports = MessageInteractive;