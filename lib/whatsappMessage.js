const validator = require('validator');

class WhatsAppMessage {
  
  constructor(recipientPhoneNumber, previousMessageId = null) {
    this.messaging_product = 'whatsapp';
    this.recipient_type = 'individual';
    this.to = recipientPhoneNumber;
    this.type = null;
    this.content = null;
    this.previousMessageId = previousMessageId;
  }

  createTextMessage(content) {
    this.type = 'text';
    this.content = {
      preview_url: validator.isURL(this.content),
      body: content
    };
    return this.toJSON();
  }

  createReactionMessage(emoji) {
    this.type = 'reaction';
    this.content = {
      message_id: this.previousMessageId,
      emoji: emoji,
    };

    return this.toJSON();
  }

  createImageMessage(imageSrc) {
    this.type = 'image';
    if (validator.isURL(imageSrc)) {
      this.content = { link: imageSrc };
    } else {
      this.content = { id: imageSrc };
    }

    return this.toJSON();
  }

  createAudioMessage(audioSrc) {
    this.type = 'audio';

    if (validator.isURL(audioSrc)) {
      this.content = { link: audioSrc };
    } else {
      this.content = { id: audioSrc };
    }

    return this.toJSON();
  }

  createDocumentMessage(documentSrc, caption, filename = null) {
    this.type = 'document';
    if (validator.isURL(documentSrc)) {
      this.content = {
        link: documentSrc,
        caption: caption,
      };
    } else {
      this.content = {
        id: documentSrc,
        caption: caption,
        filename: filename,
      };
    }

    return this.toJSON();
  }
  
  createStickerMessage(stickerSrc) {
    this.type = 'sticker';
    if (validator.isURL(stickerSrc)) {
      this.content = { link: stickerSrc };
    } else {
      this.content = { id: stickerSrc };
    }

    return this.toJSON();
  }
  
  createVideoMessage(videoSrc, caption){
    this.type = 'video';
    if (validator.isURL(videoSrc)) {
      this.content = { link: videoSrc };
    } else {
      this.content = { id: videoSrc };
    }
    this.content.caption = caption;

    return this.toJSON();
  }
  
  createContactoMessage(contacto){
    this.type = 'contacts';
    this.content = contacto;
    return this.toJSON();
  }
  
  createLocationMessage(latitude, longitude, name, address) {
    this.type = 'location';
    this.content = {
      latitude: latitude,
      longitude: longitude,
      name: name,
      address: address
    };

    return this.toJSON();
  }
  
  createTemplateMessage(templateName, languageCode, components) {
    this.messageData.type = "template";
    this.messageData.template = {
      name: templateName,
      language: {
        code: languageCode
      },
      components: components.map(component => component.toJSON()) // Llama al método toJSON() aquí
    };
    return this.toJSON();
  }
  
  createInteractiveMessage(content) {
    this.type = 'interactive';
    this.content = content;

    return this.toJSON();
  }

  toJSON() {
    let messageJson = {
      messaging_product: this.messaging_product,
      recipient_type: this.recipient_type,
      to: this.to,
      type: this.type,
    };

    if (this.previousMessageId && this.type !== 'reaction') {
      messageJson.context = {
        message_id: this.previousMessageId,
      };
    }

    if (this.type === 'text') {
      messageJson.text = this.content;
    } else if (this.type === 'reaction') {
      messageJson.reaction = this.content;
    } else if (this.type === 'image') {
      messageJson.image = this.content;
    } else if (this.type === 'audio') {
      messageJson.audio = this.content;
    } else if (this.type === 'document') {
      messageJson.document = this.content;
    }else if (this.type === 'sticker') {
      messageJson.sticker = this.content;
    }else if (this.type === 'video') {
      messageJson.video = this.content;
    }else if (this.type === 'contacts') {
      messageJson.contacts = [];
      messageJson.contacts.add(this.content);
    }else if (this.type === 'location') {
      messageJson.location = this.content;
    }else if (this.type === 'template') {
      messageJson.template = this.content;
    }else if (this.type === 'interactive') {
      messageJson.interactive = this.content;
    }
    // Aquí puedes agregar más condiciones según los tipos de mensajes que quieras manejar

    return JSON.stringify(messageJson);
  }
}

module.exports = WhatsAppMessage;