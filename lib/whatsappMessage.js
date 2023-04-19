const validator = require('validator');

class WhatsAppMessage {
  
  constructor(recipientPhoneNumber) {
    this.messaging_product = 'whatsapp';
    this.recipient_type = 'individual';
    this.to = recipientPhoneNumber;
  }

  createTextMessage(content, previousMessageId = null) {
    this.type = 'text';
    this.content = {
      preview_url: validator.isURL(this.content),
      body: content
    };
    this.previousMessageId = previousMessageId;

    return this.toJSON();
  }

  createReactionMessage(emoji, previousMessageId) {
    this.type = 'reaction';
    this.content = {
      message_id: previousMessageId,
      emoji: emoji,
    };
    this.previousMessageId = null;

    return this.toJSON();
  }

  createImageMessage(imageSrc, previousMessageId = null) {
    this.type = 'image';
    this.previousMessageId = previousMessageId;

    if (validator.isURL(imageSrc)) {
      this.content = { link: imageSrc };
    } else {
      this.content = { id: imageSrc };
    }

    return this.toJSON();
  }

  createAudioMessage(audioSrc, previousMessageId = null) {
    this.type = 'audio';
    this.previousMessageId = previousMessageId;

    if (validator.isURL(audioSrc)) {
      this.content = { link: audioSrc };
    } else {
      this.content = { id: audioSrc };
    }

    return this.toJSON();
  }

  createDocumentMessage(documentSrc, caption, filename = null, previousMessageId = null) {
    this.type = 'document';
    this.previousMessageId = previousMessageId;

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
  
  createStickerMessage(stickerSrc, previousMessageId = null) {
    this.type = 'sticker';
    if (validator.isURL(stickerSrc)) {
      this.content = { link: stickerSrc };
    } else {
      this.content = { id: stickerSrc };
    }
    this.previousMessageId = previousMessageId;

    return this.toJSON();
  }
  
  createVideoMessage(videoSrc, caption, previousMessageId = null){
    this.type = 'video';
    if (validator.isURL(videoSrc)) {
      this.content = { link: videoSrc };
    } else {
      this.content = { id: videoSrc };
    }
    this.content.caption = caption;
    this.previousMessageId = previousMessageId;

    return this.toJSON();
  }

  toJSON() {
    let messageJson = {
      messaging_product: this.messaging_product,
      recipient_type: this.recipient_type,
      to: this.to,
      type: this.type,
    };

    if (this.previousMessageId) {
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
    }
    // Aquí puedes agregar más condiciones según los tipos de mensajes que quieras manejar

    return JSON.stringify(messageJson);
  }
}

module.exports = WhatsAppMessage;