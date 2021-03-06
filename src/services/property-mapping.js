const hotelMapping = {
  manager: 'managerAddress',
};

const mapHotelObjectToResponse = (hotel) => {
  return Object.keys(hotel).reduce((newHotel, field) => {
    const newField = hotelMapping[field] || field;
    newHotel[newField] = hotel[field];
    return newHotel;
  }, {});
};

const fieldMapping = {
  managerAddress: 'manager',
};

const mapHotelFieldsFromQuery = (fields) => {
  return fields.reduce((newFields, field) => {
    const newField = fieldMapping[field] || field;
    newFields.push(newField);
    return newFields;
  }, []);
};

module.exports = {
  mapHotelObjectToResponse,
  mapHotelFieldsFromQuery,
};
