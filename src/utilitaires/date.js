const dateInvalide = (chaineDate) => Number.isNaN(new Date(chaineDate).valueOf());

module.exports = { dateInvalide };
