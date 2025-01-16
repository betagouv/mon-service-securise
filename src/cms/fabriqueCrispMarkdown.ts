const CrispMarkdown = require('./crispMarkdown');

const fabriqueCrispMarkdown = (...args) => new CrispMarkdown(...args);

module.exports = fabriqueCrispMarkdown;
