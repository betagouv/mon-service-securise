import { beforeEach } from 'vitest';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { UUID } from '../../../src/typesBasiques.ts';
import testeurMSS from '../testeurMSS.js';

describe('Les routes non connectées des webhooks', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  describe('quand requête POST sur `/webhooks/updateConsentementPixelDeSuivi`', () => {
    /* eslint-disable no-underscore-dangle */
    const bodyBrevo = () => ({
      id: 2086247,
      event: 'contact_updated',
      email: 'jean.dujardin@beta.gouv.fr',
      date: '2026-07-17 14:24:30',
      ts: 1784298270,
      content: [
        {
          email: 'jean.dujardin@beta.gouv.fr',
          attributes: {
            _PIXEL_TRACKING_CONSENT: true,
            _PIXEL_TRACKING_CONSENT_DATE: '2026-07-17T14:24:30.070Z',
          },
        },
      ],
    });

    it("retourne une erreur HTTP 424 si l'adresse email est introuvable", async () => {
      testeur.depotDonnees().utilisateurAvecEmail = async () => undefined;

      await testeur.verifieRequeteGenereErreurHTTP(
        424,
        { erreur: "L'email fourni est introuvable" },
        {
          method: 'post',
          url: '/webhooks/updateConsentementPixelDeSuivi',
          data: bodyBrevo(),
        }
      );
    });

    it("vérifie l'adresse IP de la requête", async () => {
      await testeur
        .middleware()
        .verifieAdresseIP(
          ['1.179.112.0/20', '172.246.240.0/20'],
          testeur.app(),
          {
            method: 'post',
            url: '/webhooks/updateConsentementPixelDeSuivi',
            data: bodyBrevo(),
          }
        );
    });

    it("ne fait rien et renvoie une 204 s'il ne s'agit pas d'une mise à jour du pixel de suivi", async () => {
      let miseAJourFaite = false;
      testeur.depotDonnees().metsAJourUtilisateur = async () => {
        miseAJourFaite = true;
      };

      const bodyPourAutreDonnee = bodyBrevo();
      // @ts-expect-error On force un autre attribut
      bodyPourAutreDonnee.content[0].attributes = { work_phone: '0102030405' };

      const { status } = await testeur.post(
        '/webhooks/updateConsentementPixelDeSuivi',
        bodyPourAutreDonnee
      );

      expect(status).toBe(204);
      expect(miseAJourFaite).toBe(false);
    });

    describe("quand l'appel Brevo est correct", () => {
      beforeEach(() => {
        const utilisateur = unUtilisateur()
          .avecId('123')
          .quiAcceptePixelDeSuivi()
          .construis();

        testeur.depotDonnees().utilisateurAvecEmail = async () => utilisateur;
      });

      it("peut enlever le consentement de l'utilisateur au pixel de suivi", async () => {
        let miseAJourFaite = false;
        testeur.depotDonnees().metsAJourUtilisateur = async (
          id: UUID,
          donnees: Record<string, unknown>
        ) => {
          expect(id).toBe('123');
          expect(donnees).toEqual({ pixelDeSuiviAccepte: false });
          miseAJourFaite = true;
        };

        const bodyQuiEnleve = bodyBrevo();
        bodyQuiEnleve.content[0].attributes._PIXEL_TRACKING_CONSENT = false;

        await testeur.post(
          '/webhooks/updateConsentementPixelDeSuivi',
          bodyQuiEnleve
        );

        expect(miseAJourFaite).toBe(true);
      });

      it("peut activer le consentement de l'utilisateur au pixel de suivi", async () => {
        let miseAJourFaite = false;
        testeur.depotDonnees().metsAJourUtilisateur = async (
          id: UUID,
          donnees: Record<string, unknown>
        ) => {
          expect(id).toBe('123');
          expect(donnees).toEqual({ pixelDeSuiviAccepte: true });
          miseAJourFaite = true;
        };

        const bodyQuiActive = bodyBrevo();
        bodyQuiActive.content[0].attributes._PIXEL_TRACKING_CONSENT = true;

        await testeur.post(
          '/webhooks/updateConsentementPixelDeSuivi',
          bodyQuiActive
        );

        expect(miseAJourFaite).toBe(true);
      });
    });
  });
});
