class TemplateComponent {
  constructor(type, subType = null, index = null) {
    this.type = type;
    this.subType = subType;
    this.index = index;
    this.parameters = [];
  }

  addParameter(parameterType, parameterValue) {
    let parameter = {
      type: parameterType,
    };

    if (parameterType === 'text') {
      parameter.text = parameterValue;
    } else if (parameterType === 'currency') {
      parameter.currency = parameterValue;
    } else if (parameterType === 'date_time') {
      parameter.date_time = parameterValue;
    } else if (parameterType === 'image') {
      parameter.image = parameterValue;
    } else if (parameterType === 'payload') {
      parameter.payload = parameterValue;
    }
    // Aquí puedes agregar más condiciones según los tipos de parámetros que quieras manejar

    this.parameters.push(parameter);
    return this;
  }

  toJSON() {
    let componentJson = {
      type: this.type,
      parameters: this.parameters,
    };

    if (this.subType) {
      componentJson.sub_type = this.subType;
    }

    if (this.index !== null) {
      componentJson.index = this.index;
    }

    return componentJson;
  }
}