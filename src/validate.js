const validate = (message, type) => {
  // Eventually this will do a lot more, but for now just make sure the type
  // field is set to the right type!
  return message && message.type && message.type == type;
};

export default validate;
