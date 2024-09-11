const enObjet = (cookie) =>
  cookie.split('; ').reduce((acc, v) => {
    const [cle, valeur] = v.split('=');
    acc[cle] = valeur;
    return acc;
  }, {});

module.exports = { enObjet };
