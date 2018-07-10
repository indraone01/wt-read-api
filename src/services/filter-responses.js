const _ = require('lodash');
const {
  OBLIGATORY_FIELDS,
  HOTEL_FIELDS,
  DESCRIPTION_FIELDS,
} = require('../constants');

const {
  mapQueryFields,
} = require('./mappings');

const VALID_FIELDS = _.union(HOTEL_FIELDS, DESCRIPTION_FIELDS);

const fieldsOf = async (fields, contents) => {
  return fields.reduce(async (plainContent, field) => {
    plainContent = await plainContent;
    plainContent[field] = await contents[field];
    return plainContent;
  }, {});
};

const fetchHotel = async (hotel, fields) => {
  let indexProperties;
  let descriptionProperties;
  let errorFields;
  try {
    const indexFields = _.intersection(fields, HOTEL_FIELDS);
    if (indexFields.length) {
      indexProperties = fieldsOf(indexFields, hotel);
    }
    const descriptionFields = _.intersection(fields, DESCRIPTION_FIELDS);
    if (descriptionFields.length) {
      const indexRow = (await hotel.dataIndex).contents;
      const description = (await indexRow.descriptionUri).contents;
      descriptionProperties = fieldsOf(descriptionFields, description);
    }
  } catch (e) {
    errorFields = {
      error: e.message,
    };
  }
  return { ...(await indexProperties), ...(await descriptionProperties), ...(await errorFields), id: hotel.address };
};

const calculateFields = async fieldsQuery => {
  const fieldsArray = fieldsQuery.split(',');
  const mappedFields = await mapQueryFields(fieldsArray);
  return _.intersection(
    VALID_FIELDS,
    _.union(OBLIGATORY_FIELDS, mappedFields)
  );
};

module.exports = {
  fetchHotel,
  calculateFields,
};
