import expect from 'expect.js';
import arrangeParametresAvis from '../../public/modules/arrangeParametresAvis.mjs';

describe("Une demande d'arrangement des paramètres des avis", () => {
  it('range les avis dans un tableau', () => {
    const parametres = {
      'statut-un-avis-0': 'defavorable',
      'statut-un-avis-1': 'favorable',
    };

    const parametresArranges = arrangeParametresAvis(parametres);

    expect(parametresArranges.avis).to.eql([{ statut: 'defavorable' }, { statut: 'favorable' }]);
  });

  it('supprime les paramètres après les avoir rangés', () => {
    const parametres = {
      'statut-un-avis-0': 'defavorable',
      'dureeValidite-un-avis-0': 'deuxAns',
      'commentaires-un-avis-0': 'Des commentaires',
    };

    const parametresArranges = arrangeParametresAvis(parametres);

    expect(parametresArranges.avis).to.eql([
      {
        statut: 'defavorable',
        dureeValidite: 'deuxAns',
        commentaires: 'Des commentaires',
      },
    ]);
    expect(parametresArranges).to.not.have.property('statut-un-avis-0');
    expect(parametresArranges).to.not.have.property('dureeValidite-un-avis-0');
    expect(parametresArranges).to.not.have.property('commentaires-un-avis-0');
  });

  it('arrange le prénom et le nom dans un tableau de collaborateurs', () => {
    const parametres = {
      'prenomNom-un-avis-0': 'Jean',
    };

    const parametresArranges = arrangeParametresAvis(parametres);

    expect(parametresArranges).to.not.have.property('prenomNom-un-avis-0');
    expect(parametresArranges).to.not.have.property('prenomNom');
    expect(parametresArranges).to.eql({ avis: [{ collaborateurs: ['Jean'] }] });
  });
});
