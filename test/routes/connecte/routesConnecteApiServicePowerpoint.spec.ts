import supertest from 'supertest';
import testeurMSS from '../testeurMSS.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.js';
import {
  unService,
  unServiceV2,
} from '../../constructeurs/constructeurService.js';
import { VersionService } from '../../../src/modeles/versionService.js';
import {
  verifieNomFichierServi,
  verifieTypeFichierServiEstPPTX,
} from '../../aides/verifieFichierServi.js';
import { DonneesSupportCommissionHomologation } from '../../../src/adaptateurs/adaptateurPowerpoint.interface.ts';

const { LECTURE } = Permissions;
const { HOMOLOGUER } = Rubriques;

describe('Le serveur MSS des routes /api/service/:id/pptx/*', () => {
  const testeur = testeurMSS();

  const recupereFichierBinaire = (url: string) =>
    supertest(testeur.app())
      .get(url)
      .buffer(true)
      .parse((reponse, callback) => {
        const morceaux: Buffer[] = [];
        reponse.on('data', (morceau: Buffer) => morceaux.push(morceau));
        reponse.on('end', () => callback(null, Buffer.concat(morceaux)));
      });

  beforeEach(() => testeur.initialise());

  describe('quand requête GET sur `/api/service/:id/pptx/supportCommissionHomologation.pptx`', () => {
    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: HOMOLOGUER }],
          testeur.app(),
          '/api/service/456/pptx/supportCommissionHomologation.pptx'
        );
    });

    it('répond 404 si le feature flag est désactivé', async () => {
      testeur.adaptateurEnvironnement().featureFlag = () => ({
        avecSupportCommissionPptx: () => false,
      });

      const reponse = await testeur.get(
        '/api/service/456/pptx/supportCommissionHomologation.pptx'
      );

      expect(reponse.status).toBe(404);
    });

    it('ne bloque pas les autres routes du service si le feature flag est désactivé', async () => {
      testeur.adaptateurEnvironnement().featureFlag = () => ({
        avecSupportCommissionPptx: () => false,
      });

      const reponse = await testeur.get('/api/service/456/indiceCyber');

      expect(reponse.status).toBe(200);
    });

    it('répond 422 si le service est en V1', async () => {
      // @ts-expect-error on ne recharge que le nécessaire
      testeur.middleware().reinitialise({
        serviceARenvoyer: unService()
          .avecVersion(VersionService.v1)
          .construis(),
      });

      const reponse = await testeur.get(
        '/api/service/456/pptx/supportCommissionHomologation.pptx'
      );

      expect(reponse.status).toBe(422);
      expect(reponse.body).toEqual({
        erreur: { code: 'SERVICE_V1_NON_SUPPORTE' },
      });
    });

    describe('pour un service V2', () => {
      beforeEach(() => {
        // @ts-expect-error on ne recharge que le nécessaire
        testeur.middleware().reinitialise({
          serviceARenvoyer: unServiceV2()
            .avecId('456')
            .avecNomService('Mon super service')
            .construis(),
        });
      });

      it("sert le support généré par l'adaptateur PowerPoint", async () => {
        testeur.adaptateurPowerpoint().genereSupportCommissionHomologation =
          async () => Buffer.from('contenu pptx');

        const reponse = await recupereFichierBinaire(
          '/api/service/456/pptx/supportCommissionHomologation.pptx'
        );

        expect(reponse.status).toBe(200);
        expect(reponse.body.toString()).toBe('contenu pptx');
      });

      it('sert un fichier de type pptx', async () => {
        await verifieTypeFichierServiEstPPTX(
          testeur.app(),
          '/api/service/456/pptx/supportCommissionHomologation.pptx'
        );
      });

      it('sert un fichier dont le nom contient la date du jour en format court', async () => {
        testeur.adaptateurHorloge().maintenant = () => new Date(2026, 10, 9);

        await verifieNomFichierServi(
          testeur.app(),
          '/api/service/456/pptx/supportCommissionHomologation.pptx',
          'MSS_support_commission_homologation_20261109.pptx'
        );
      });

      it("transmet à l'adaptateur le nom du service et la date du jour", async () => {
        const maintenant = new Date(2026, 10, 9);
        testeur.adaptateurHorloge().maintenant = () => maintenant;
        let donneesRecues;
        testeur.adaptateurPowerpoint().genereSupportCommissionHomologation =
          async (donnees: DonneesSupportCommissionHomologation) => {
            donneesRecues = donnees;
            return Buffer.from('contenu pptx');
          };

        await testeur.get(
          '/api/service/456/pptx/supportCommissionHomologation.pptx'
        );

        expect(donneesRecues).toEqual({
          nomService: 'Mon super service',
          dateCreation: maintenant,
        });
      });
    });
  });
});
