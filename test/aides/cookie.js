const expect = require('expect.js');

const enObjet = (cookie) =>
  cookie.split('; ').reduce((acc, v) => {
    const [cle, valeur] = v.split('=');
    acc[cle] = valeur;
    return acc;
  }, {});

const decodeTokenDuCookie = (reponse, indiceHeader) => {
  try {
    const headerCookie = reponse.headers['set-cookie'];
    const cookieSession = enObjet(headerCookie[indiceHeader]);
    return JSON.parse(Buffer.from(cookieSession.session, 'base64').toString());
  } catch (e) {
    return undefined;
  }
};

const expectContenuSessionValide = (
  reponse,
  source,
  cguAcceptees,
  estInvite,
  indiceDuHeader = 0
) => {
  expect(decodeTokenDuCookie(reponse, indiceDuHeader).token).to.be(
    `un token de source ${source}`
  );
  expect(decodeTokenDuCookie(reponse, indiceDuHeader).cguAcceptees).to.be(
    cguAcceptees
  );
  expect(decodeTokenDuCookie(reponse, indiceDuHeader).estInvite).to.be(
    estInvite
  );
};

module.exports = { enObjet, decodeTokenDuCookie, expectContenuSessionValide };
