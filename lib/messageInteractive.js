class MessageInteractive{
  construct(type){
    this.type = type;
    this.header = null;
    this.body = null;
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
  
}

module.exports = MessageInteractive;