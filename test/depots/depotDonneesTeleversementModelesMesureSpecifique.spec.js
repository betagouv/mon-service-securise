import expect from 'expect.js';
import * as DepotDonneesTeleversementModelesMesureSpecifique from '../../src/depots/depotDonneesTeleversementModelesMesureSpecifique.js';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import * as DepotDonneesModelesMesureSpecifique from '../../src/depotDonnees.js';
import { fabriqueAdaptateurUUID } from '../../src/adaptateurs/adaptateurUUID.js';

import {
  ErreurUtilisateurInexistant,
  ErreurTeleversementInexistant,
  ErreurTeleversementInvalide,
} from '../../src/erreurs.js';

import { unUtilisateur } from '../constructeurs/constructeurUtilisateur.js';
import * as Referentiel from '../../src/referentiel.js';
import { fabriqueBusPourLesTests } from '../bus/aides/busPourLesTests.js';
import EvenementModelesMesureSpecifiqueImportes from '../../src/bus/evenementModelesMesureSpecifiqueImportes.js';

describe('Le dépôt de données des téléversements de modèles de mesure spécifique', () => {
  let persistance;
  let chiffrement;
  let referentiel;
  let depotModelesMesureSpecifique;
  let busEvenements;

  beforeEach(() => {
    busEvenements = fabriqueBusPourLesTests();
    chiffrement = {
      chiffre: (donnees) =>
        donnees.map((donnee) => ({ ...donnee, chiffrees: true })),
      dechiffre: (donnees) =>
        donnees.map(({ chiffrees, ...autresDonnees }) => autresDonnees),
    };
    persistance = unePersistanceMemoire().construis();
    referentiel = Referentiel.creeReferentiel({
      categoriesMesures: { gouvernance: 'Gouvernance' },
      modelesMesureSpecifique: { nombreMaximumParUtilisateur: 40 },
    });
  });

  const leDepot = () => {
    depotModelesMesureSpecifique =
      DepotDonneesModelesMesureSpecifique.creeDepot({
        adaptateurPersistance: persistance,
        adaptateurChiffrement: {
          chiffre: (donnees) => ({ ...donnees, chiffrees: true }),
        },
        adaptateurUUID: fabriqueAdaptateurUUID(),
        referentiel,
      });

    return DepotDonneesTeleversementModelesMesureSpecifique.creeDepot({
      adaptateurPersistance: persistance,
      adaptateurChiffrement: chiffrement,
      depotModelesMesureSpecifique,
      referentiel,
      busEvenements,
    });
  };

  describe('sur un nouveau téléversement', () => {
    it('persiste en chiffrant les données', async () => {
      let donneesPersistees;
      persistance.ajouteTeleversementModelesMesureSpecifique = async (
        idUtilisateur,
        donnees
      ) => {
        donneesPersistees = { idUtilisateur, donnees };
      };

      const depot = leDepot();
      await depot.nouveauTeleversementModelesMesureSpecifique('U1', [
        { description: 'la mesure téléversée' },
      ]);

      expect(donneesPersistees).to.eql({
        idUtilisateur: 'U1',
        donnees: [{ description: 'la mesure téléversée', chiffrees: true }],
      });
    });
  });

  describe("sur demande de lecture d'un téléversement", () => {
    it('déchiffre les données persistées', async () => {
      const depot = leDepot();
      await depot.nouveauTeleversementModelesMesureSpecifique('U1', [
        { description: 'la mesure téléversée' },
      ]);

      const televersement =
        await depot.lisTeleversementModelesMesureSpecifique('U1');

      expect(televersement.modelesTeleverses).to.eql([
        { description: 'la mesure téléversée' },
      ]);
    });

    it("récupère le nombre de modèles de mesure spécifique restant pour l'utilisateur", async () => {
      referentiel.nombreMaximumDeModelesMesureSpecifiqueParUtilisateur = () =>
        10;
      persistance = unePersistanceMemoire()
        .avecUnModeleDeMesureSpecifique({ id: 'MOD-1', idUtilisateur: 'U1' })
        .avecUnModeleDeMesureSpecifique({ id: 'MOD-2', idUtilisateur: 'U1' })
        .construis();
      const depot = leDepot();
      await depot.nouveauTeleversementModelesMesureSpecifique('U1', [
        { description: 'la mesure téléversée' },
      ]);

      const televersement =
        await depot.lisTeleversementModelesMesureSpecifique('U1');

      expect(televersement.nbMaximumLignesAutorisees).to.be(10 - 2);
    });
  });

  describe("sur demande de suppression du téléversement d'un utilisateur", () => {
    it('supprime le téléversement', async () => {
      const depot = leDepot();
      await depot.nouveauTeleversementModelesMesureSpecifique('U1', [
        { description: 'la mesure téléversée' },
      ]);

      await depot.supprimeTeleversementModelesMesureSpecifique('U1');

      const televersement =
        await depot.lisTeleversementModelesMesureSpecifique('U1');
      expect(televersement).to.be(undefined);
    });
  });

  describe("sur demande de confirmation du téléversement d'un utilisateur", () => {
    beforeEach(() => {
      persistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId('U1').donnees)
        .construis();
    });

    it("jette une erreur si l'utilisateur n'existe pas", async () => {
      try {
        await leDepot().confirmeTeleversementModelesMesureSpecifique(
          'U-INTROUVABLE'
        );
        expect().fail("L'appel aurait dû lever une erreur.");
      } catch (e) {
        expect(e).to.be.an(ErreurUtilisateurInexistant);
      }
    });

    it("jette une erreur si aucun téléversement n'est en cours", async () => {
      try {
        await leDepot().confirmeTeleversementModelesMesureSpecifique('U1');
        expect().fail("L'appel aurait dû lever une erreur.");
      } catch (e) {
        expect(e).to.be.an(ErreurTeleversementInexistant);
      }
    });

    it('jette une erreur si le téléversement en cours est invalide', async () => {
      const depot = leDepot();
      await depot.nouveauTeleversementModelesMesureSpecifique('U1', [
        { description: 'une description 1', categorie: 'UneMauvaiseCategorie' },
      ]);

      try {
        await depot.confirmeTeleversementModelesMesureSpecifique('U1');
        expect().fail("L'appel aurait dû lever une erreur.");
      } catch (e) {
        expect(e).to.be.an(ErreurTeleversementInvalide);
      }
    });

    describe('lorsque le téléversement est valide', () => {
      let depot;
      beforeEach(async () => {
        depot = leDepot();
        await depot.nouveauTeleversementModelesMesureSpecifique('U1', [
          { description: 'une description 1', categorie: 'Gouvernance' },
        ]);
      });

      it("délègue au dépôt de modèles de mesures spécifiques l'ajout des nouveaux modèles", async () => {
        let donneesRecues;
        depotModelesMesureSpecifique.ajoutePlusieursModelesMesureSpecifique =
          async (idUtilisateur, donnees) => {
            donneesRecues = { idUtilisateur, donnees };
          };

        await depot.confirmeTeleversementModelesMesureSpecifique('U1');

        expect(donneesRecues.idUtilisateur).to.be('U1');
        expect(donneesRecues.donnees).to.eql([
          { description: 'une description 1', categorie: 'gouvernance' },
        ]);
      });

      it("publie sur le bus d'évènements le téléversement confirmé", async () => {
        await depot.confirmeTeleversementModelesMesureSpecifique('U1');

        expect(
          busEvenements.aRecuUnEvenement(
            EvenementModelesMesureSpecifiqueImportes
          )
        );
        const recu = busEvenements.recupereEvenement(
          EvenementModelesMesureSpecifiqueImportes
        );
        expect(recu.idUtilisateur).to.be('U1');
        expect(recu.nbModelesMesureSpecifiqueImportes).to.be(1);
      });

      it('supprime le téléversement', async () => {
        await depot.confirmeTeleversementModelesMesureSpecifique('U1');

        const televersementSupprime =
          await depot.lisTeleversementModelesMesureSpecifique('U1');
        expect(televersementSupprime).to.be(undefined);
      });
    });
  });
});
