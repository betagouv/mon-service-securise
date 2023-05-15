const expect = require('expect.js');

const EtapeAvis = require('../../../src/modeles/etapes/etapeAvis');
const Referentiel = require('../../../src/referentiel');

describe('Une étape « Avis »', () => {
  const referentiel = Referentiel.creeReferentiel({
    echeancesRenouvellement: { unAn: {} },
    statutsAvisDossierHomologation: { favorable: {} },
  });

  it('sait se convertir en JSON ', () => {
    const etape = new EtapeAvis(
      {
        avis: [
          {
            collaborateurs: ['Jean Durand'],
            statut: 'favorable',
            dureeValidite: 'unAn',
            commentaires: 'OK pour moi',
          },
        ],
        avecAvis: true,
      },
      referentiel
    );

    expect(etape.toJSON()).to.eql({
      avis: [
        {
          collaborateurs: ['Jean Durand'],
          statut: 'favorable',
          dureeValidite: 'unAn',
          commentaires: 'OK pour moi',
        },
      ],
      avecAvis: true,
    });
  });

  it("reste robuste s'il n'y a pas d'avis dans les données", () => {
    const etape = new EtapeAvis();

    expect(etape.toJSON()).to.eql({ avis: [], avecAvis: null });
  });

  it("sait déclarer l'étape sans avis", () => {
    const etape = new EtapeAvis({}, referentiel);
    etape.enregistreAvis([
      {
        collaborateurs: ['Jean Durand'],
        statut: 'favorable',
        dureeValidite: 'unAn',
        commentaires: 'OK pour moi',
      },
    ]);

    etape.declareSansAvis();

    expect(etape.avecAvis).to.be(false);
    expect(etape.avis).to.eql([]);
  });

  it('sait enregistrer des avis', () => {
    const etape = new EtapeAvis({}, referentiel);

    etape.enregistreAvis([
      {
        collaborateurs: ['Jean Durand'],
        statut: 'favorable',
        dureeValidite: 'unAn',
        commentaires: 'OK pour moi',
      },
    ]);

    expect(etape.avecAvis).to.be(true);
  });

  describe("sur vérification que l'étape est complète", () => {
    it('est incomplète par défaut', () => {
      const etapeParDefaut = new EtapeAvis();
      expect(etapeParDefaut.estComplete()).to.be(false);
    });

    it("est complète s'il n'y a aucun avis et qu'elle est déclarée sans avis", () => {
      const aucunAvis = new EtapeAvis({ avis: [], avecAvis: false });
      expect(aucunAvis.estComplete()).to.be(true);
    });

    describe("dans le cas où l'étape est déclarée avec avis", () => {
      it("n'est pas complète dès qu'un avis n'est pas saisi", () => {
        const sansPrenomNom = { statut: 'favorable', dureeValidite: 'unAn' };
        const avecAvisNonSaisis = new EtapeAvis(
          {
            avis: [sansPrenomNom],
            avecAvis: true,
          },
          referentiel
        );

        expect(avecAvisNonSaisis.estComplete()).to.be(false);
      });

      it('est complète si tous les avis sont saisis', () => {
        const avecAvisSaisis = new EtapeAvis(
          {
            avis: [
              {
                collaborateurs: ['Jean Durand'],
                statut: 'favorable',
                dureeValidite: 'unAn',
              },
            ],
            avecAvis: true,
          },
          referentiel
        );

        expect(avecAvisSaisis.estComplete()).to.be(true);
      });
    });
  });
});
