const expect = require('expect.js');

const EtapeAvis = require('../../../src/modeles/etapes/etapeAvis');
const Referentiel = require('../../../src/referentiel');

describe('Une étape « Avis »', () => {
  it('sait se convertir en JSON ', () => {
    const referentiel = Referentiel.creeReferentiel({
      echeancesRenouvellement: { unAn: {} },
      statutAvisDossierHomologation: { favorable: { } },
    });

    const etape = new EtapeAvis({
      avis: [
        { prenomNom: 'Jean Durand', statut: 'favorable', dureeValidite: 'unAn', commentaires: 'OK pour moi' },
      ],
    }, referentiel);

    expect(etape.toJSON()).to.eql({
      avis: [
        { prenomNom: 'Jean Durand', statut: 'favorable', dureeValidite: 'unAn', commentaires: 'OK pour moi' },
      ],
    });
  });

  it("reste robuste s'il n'y a pas d'avis dans les données", () => {
    const etape = new EtapeAvis();

    expect(etape.toJSON()).to.eql({ avis: [] });
  });

  describe("sur vérification que l'étape est complète", () => {
    it("n'est pas complète s'il n'y a aucun avis", () => {
      const aucunAvis = new EtapeAvis();
      expect(aucunAvis.estComplete()).to.be(false);
    });

    it("n'est pas complète dès qu'un avis n'est pas saisi", () => {
      const referentiel = Referentiel.creeReferentiel({
        echeancesRenouvellement: { unAn: {} },
        statutAvisDossierHomologation: { favorable: { } },
      });
      const sansPrenomNom = { statut: 'favorable', dureeValidite: 'unAn' };
      const avecAvisNonSaisis = new EtapeAvis({ avis: [sansPrenomNom] }, referentiel);

      expect(avecAvisNonSaisis.estComplete()).to.be(false);
    });

    it('est complète si tous les avis sont saisis', () => {
      const referentiel = Referentiel.creeReferentiel({
        echeancesRenouvellement: { unAn: {} },
        statutAvisDossierHomologation: { favorable: { } },
      });
      const avecAvisSaisis = new EtapeAvis(
        { avis: [{ prenomNom: 'Jean Durand', statut: 'favorable', dureeValidite: 'unAn' }] },
        referentiel
      );

      expect(avecAvisSaisis.estComplete()).to.be(true);
    });
  });
});
