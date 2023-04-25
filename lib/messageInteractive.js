class MessageInteractive {
  constructor(type) {
    this.type = type;
    this.header = null;
    this.body = null;
    this.footer = null;
    this.action = null;
  }

  addHeader(type, content) {
    if(this.header == null){
      this.header = {};
    }
    this.header.type = type;
    if (type === "text") {
      this.header.text = content;
    } else if (type === "document") {
      this.header.document = content;
    } else if (type === "image") {
      this.header.image = content;
    } else if (type === "video") {
      this.header.video = content;
    }
    return this;
  }

  addBody(text) {
    if(this.body == null){
      this.body = {};
    }
    this.body.text = text;
    return this;
  }

  addFooter(text) {
    if(this.footer == null){
      this.footer = {};
    }
    this.footer.text = text;
    return this;
  }

  addAction(action) {
    this.action = action;
    return this;
  }

  toJSON() {
    let Json = {
      type: this.type
    };

    if (this.header) {
      Json.header = this.header;
    }
    if (this.body) {
      Json.body = this.body;
    }
    if (this.footer) {
      Json.footer = this.footer;
    }
    if (this.action) {
      Json.action = this.action;
    }

    return Json;
  }
}

module.exports = MessageInteractive;
