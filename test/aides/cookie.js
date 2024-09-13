const enObjet = (cookie) =>
  cookie.split('; ').reduce((acc, v) => {
    const [cle, valeur] = v.split('=');
    acc[cle] = valeur;
    return acc;
  }, {});

const decodeTokenDuCookie = (reponse, indiceHeader) => {
  const headerCookie = reponse.headers['set-cookie'];
  const cookieSession = enObjet(headerCookie[indiceHeader]);
  return JSON.parse(Buffer.from(cookieSession.token, 'base64').toString());
};

module.exports = { enObjet, decodeTokenDuCookie };
