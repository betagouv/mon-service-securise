const expect = require('expect.js');

const VueStatutHomologation = require('../../../src/modeles/objetsVues/vueStatutHomologation');
const Referentiel = require('../../../src/referentiel');
const { unService } = require('../../constructeurs/constructeurService');
const { unDossier } = require('../../constructeurs/constructeurDossier');
const { dateEnFrancais } = require('../../../src/utilitaires/date');

describe("Les données de statut d'une homologation", () => {
  describe("sur demande du statut d'homologation", () => {
    const referentiel = Referentiel.creeReferentiel({
      statutsHomologation: {
        expiree: { libelle: 'Expirée', ordre: 0 },
        bientotExpiree: { libelle: 'Bientôt expirée', ordre: 1 },
        nonRealisee: { libelle: 'Non réalisée', ordre: 3 },
        bientotActivee: { libelle: 'Bientôt activée', ordre: 4 },
        activee: { libelle: 'Activée', ordre: 5 },
      },
      etapesParcoursHomologation: [{ numero: 1, id: 'autorite' }],
      echeancesRenouvellement: {
        unAn: {
          description: '1 an',
          nbMoisDecalage: 12,
          nbMoisBientotExpire: 2,
        },
      },
      statutsAvisDossierHomologation: {
        favorable: { description: 'Favorable' },
      },
    });

    it('retourne le lien pour démarrer une homologation pour le statut « Non réalisée »', () => {
      const homologationNonRealisee = unService(referentiel)
        .avecId('123')
        .avecDossiers([])
        .construis();

      const donnees = new VueStatutHomologation(
        homologationNonRealisee,
        referentiel
      ).donnees();

      expect(donnees).to.eql({
        statut: 'nonRealisee',
        libelle: 'Non réalisée',
        ordre: 3,
        metadonnees: {
          liens: [
            {
              libelle: "Commencer l'homologation",
              url: '/service/123/homologation/edition/etape/autorite',
            },
          ],
        },
      });
    });

    it("retourne la date de début d'activation et la durée pour le statut « Bientôt activée »", () => {
      const dateFuture = new Date();
      dateFuture.setDate(dateFuture.getDate() + 10);

      const homologationBientotActive = unService(referentiel)
        .avecId('123')
        .avecDossiers([
          unDossier()
            .quiEstComplet()
            .avecDecision(dateFuture.toISOString(), 'unAn').donnees,
        ])
        .construis();

      const donnees = new VueStatutHomologation(
        homologationBientotActive,
        referentiel
      ).donnees();

      expect(donnees).to.eql({
        statut: 'bientotActivee',
        libelle: 'Bientôt activée',
        ordre: 4,
        metadonnees: {
          validite: { debut: dateEnFrancais(dateFuture), duree: '1 an' },
        },
      });
    });

    it("retourne la date de fin et la durée pour le statut 'Activée'", () => {
      const homologationActive = unService(referentiel)
        .avecId('123')
        .avecDossiers([
          unDossier(referentiel).quiEstComplet().quiEstActif(10).donnees,
        ])
        .construis();

      const donnees = new VueStatutHomologation(
        homologationActive,
        referentiel
      ).donnees();

      expect(donnees).to.eql({
        statut: 'activee',
        libelle: 'Activée',
        ordre: 5,
        metadonnees: {
          validite: {
            duree: '1 an',
            fin: homologationActive.dossiers
              .dossierActif()
              .descriptionProchaineDateHomologation(),
          },
        },
      });
    });

    it("retourne la date de fin et le lien pour renouveller une homologation pour le statut 'Bientôt expirée'", () => {
      const homologationBientotExpiree = unService(referentiel)
        .avecId('123')
        .avecDossiers([
          unDossier(referentiel).quiEstComplet().quiEstActif(340).donnees,
        ])
        .construis();

      const donnees = new VueStatutHomologation(
        homologationBientotExpiree,
        referentiel
      ).donnees();

      expect(donnees).to.eql({
        statut: 'bientotExpiree',
        libelle: 'Bientôt expirée',
        ordre: 1,
        metadonnees: {
          liens: [
            {
              libelle: "Renouveler l'homologation",
              url: '/service/123/homologation/edition/etape/autorite',
            },
          ],
          validite: {
            fin: homologationBientotExpiree.dossiers
              .dossierActif()
              .descriptionProchaineDateHomologation(),
          },
        },
      });
    });

    it("retourne la date de fin et le lien pour renouveller une homologation pour le statut 'Expirée'", () => {
      const homologationExpiree = unService(referentiel)
        .avecId('123')
        .avecDossiers([
          unDossier(referentiel).quiEstComplet().quiEstExpire().donnees,
        ])
        .construis();

      const donnees = new VueStatutHomologation(
        homologationExpiree,
        referentiel
      ).donnees();

      expect(donnees).to.eql({
        statut: 'expiree',
        libelle: 'Expirée',
        ordre: 0,
        metadonnees: {
          liens: [
            {
              libelle: "Renouveler l'homologation",
              url: '/service/123/homologation/edition/etape/autorite',
            },
          ],
          validite: {
            fin: homologationExpiree.dossiers.items[0].descriptionProchaineDateHomologation(),
          },
        },
      });
    });
  });
});
