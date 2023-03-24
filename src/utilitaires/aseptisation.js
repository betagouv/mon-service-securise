const valeurBooleenne = (valeur) => {
  switch (valeur) {
    case 'true': return true;
    case 'false': return false;
    default: return undefined;
  }
};

module.exports = { valeurBooleenne };
