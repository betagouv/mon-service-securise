import expect from 'expect.js';
import convertisReponseOuiNon from '../../public/modules/convertisReponseOuiNon.mjs';

describe('Une demande de conversion de réponse oui non', () => {
  it('retourne le booléen vrai quand la réponse est oui', () => {
    expect(convertisReponseOuiNon('oui')).to.be(true);
  });

  it('retourne le booléen faux quand la réponse est non', () => {
    expect(convertisReponseOuiNon('non')).to.be(false);
  });

  it('est indéfinie quand la réponse est ni oui ni non', () => {
    expect(convertisReponseOuiNon('peut-être')).to.equal(undefined);
  });

  it("est indéfinie quand la réponse n'est pas présente", () => {
    expect(convertisReponseOuiNon()).to.equal(undefined);
  });
});
