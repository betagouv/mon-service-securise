const uuid = require('uuid');

const genereUUID = () => uuid.v4();

const fabriqueAdaptateurUUID = () => ({ genereUUID });

module.exports = { genereUUID, fabriqueAdaptateurUUID };
