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
    return JSON.parse(Buffer.from(cookieSession.token, 'base64').toString());
  } catch (e) {
    return undefined;
  }
};

const expectContenuSessionValide = (
  reponse,
  source,
  cguAcceptees,
  estInvite
) => {
  expect(decodeTokenDuCookie(reponse, 0).token).to.be(
    `un token de source ${source}`
  );
  expect(decodeTokenDuCookie(reponse, 0).cguAcceptees).to.be(cguAcceptees);
  expect(decodeTokenDuCookie(reponse, 0).estInvite).to.be(estInvite);
};

module.exports = { enObjet, decodeTokenDuCookie, expectContenuSessionValide };
