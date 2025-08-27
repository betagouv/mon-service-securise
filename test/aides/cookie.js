import expect from 'expect.js';

const enObjet = (cookie) =>
  cookie.split('; ').reduce((acc, v) => {
    const [cle, valeur] = v.split('=');
    acc[cle] = valeur;
    return acc;
  }, {});

const decodeSessionDuCookie = (reponse, indiceHeader) => {
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
  expect(decodeSessionDuCookie(reponse, indiceDuHeader).token).to.be(
    `un token de source ${source}`
  );
  expect(decodeSessionDuCookie(reponse, indiceDuHeader).cguAcceptees).to.be(
    cguAcceptees
  );
  expect(decodeSessionDuCookie(reponse, indiceDuHeader).estInvite).to.be(
    estInvite
  );
};

export default { enObjet, decodeSessionDuCookie, expectContenuSessionValide };
