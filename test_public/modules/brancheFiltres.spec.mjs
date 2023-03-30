import expect from 'expect.js';
import { idServicesAAfficher } from '../../public/modules/brancheFiltres.mjs';

describe('Les identifiants des services à afficher', () => {
  const desDonneesFiltres = new Map([
    ['Organisation 1', ['1', '2', '3']],
    ['Organisation 2', ['2', '3']],
    ['Organisation 3', ['2']],
    ['Organisation 4', ['1']],
  ]);

  it("sont vides quand il n'y a pas d'organisations", () => {
    expect(idServicesAAfficher(desDonneesFiltres, [])).to.eql([]);
  });

  it('sont les identifiants présent de organisation quand il y a une organisation', () => {
    expect(idServicesAAfficher(desDonneesFiltres, ['Organisation 2'])).to.eql(['2', '3']);
  });

  it('sont les identifiants présents dans les toutes les organisations', () => {
    expect(idServicesAAfficher(desDonneesFiltres, ['Organisation 1', 'Organisation 3'])).to.eql(['2']);
  });

  it("sont vides quand il n'y a pas d'identifiant présent dans les toutes les organisations", () => {
    expect(idServicesAAfficher(desDonneesFiltres, ['Organisation 2', 'Organisation 4'])).to.eql([]);
  });
});
