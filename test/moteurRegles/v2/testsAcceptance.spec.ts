import { beforeEach } from 'vitest';
import { LecteurDeCSVDeReglesV2 } from '../../../src/moteurRegles/v2/parsing/lecteurDeCSVDeReglesV2.js';
import {
  CategorieDonneesTraitees,
  mesuresV2,
} from '../../../donneesReferentielMesuresV2.js';
import * as Referentiel from '../../../src/referentiel.js';
import donneesReferentiel from '../../../donneesReferentiel.js';
import { MoteurReglesV2 } from '../../../src/moteurRegles/v2/moteurReglesV2.js';
import { uneDescriptionV2Valide } from '../../constructeurs/constructeurDescriptionServiceV2.js';
import { DescriptionServiceV2 } from '../../../src/modeles/descriptionServiceV2.js';
import { mesuresCas1 } from './mesuresCas1.js';
import { mesuresCas2 } from './mesuresCas2.js';
import { mesuresCas3 } from './mesuresCas3.js';

/*
  Commande pour exporter les mesures depuis le fichier CSV :

  echo "export const mesuresCas4 = " > mesuresCas4.ts && \
  mlr --icsv --ojson cat MESURES_CAS_4.csv | \
  jq 'map(del(.["B"]) | del(.["D"]) | del(.["C"]) | .["indispensable"] = (."E" == "Indispensable") | del(.["E"]) | {(."A"): (del(."A"))}) | add' >> mesuresCas4.ts && \
  echo ";" >> mesuresCas4.ts
 */

const justeLaMesureEtSonChampIndispensable = (mesures) =>
  Object.fromEntries(
    Object.entries(mesures).map(([id, mesure]) => [
      id,
      { indispensable: mesure.indispensable },
    ])
  );

describe("Les tests d'acceptance du nouveau moteur de règles et de niveau de sécurité V2", () => {
  let moteur: MoteurReglesV2;

  beforeEach(async () => {
    const referentiel = Referentiel.creeReferentiel(donneesReferentiel);
    const lecteur = new LecteurDeCSVDeReglesV2(mesuresV2);
    const reglesDeProd = await lecteur.lis(
      `${__dirname}/../../../src/moteurRegles/v2/mesures_V2_prod_30-09-2025.csv`
    );

    moteur = new MoteurReglesV2(referentiel, reglesDeProd);
  });

  it('vérifie le cas numéro 1', async () => {
    const audienceCible = 'limitee';
    const categories: CategorieDonneesTraitees[] = ['documentsRHSensibles'];
    const duree = 'moinsDe12h';
    const ouvertureSysteme = 'accessibleSurInternet';
    const volume = 'eleve';

    expect(
      DescriptionServiceV2.niveauSecuriteMinimalRequis({
        audienceCible,
        autresDonneesTraitees: [],
        categories,
        disponibilite: duree,
        ouvertureSysteme,
        volumetrie: volume,
      })
    ).toBe('niveau3');

    const cas1 = uneDescriptionV2Valide()
      .avecCategoriesDonneesTraitees(categories)
      .avecVolumeDonneesTraitees(volume)
      .avecLocalisationDonneesTraitees('horsUE')
      .avecDureeDysfonctionnementAcceptable(duree)
      .avecAudienceCible(audienceCible)
      .avecOuvertureSysteme(ouvertureSysteme)
      .avecSpecificitesProjet([
        'accesPhysiqueAuxSallesTechniques',
        'annuaire',
        'echangeOuReceptionEmails',
      ])
      .avecTypesService(['serviceEnLigne'])
      .avecTypeHebergement('onPremise')
      .quiExternalise(['administrationTechnique']);

    const mesures = moteur.mesures(
      cas1.avecNiveauSecurite('niveau3').construis()
    );

    expect(justeLaMesureEtSonChampIndispensable(mesures)).toEqual(mesuresCas1);
  });

  it('vérifie le cas numéro 2', async () => {
    const audienceCible = 'moyenne';
    const categories: CategorieDonneesTraitees[] = [
      'donneesAdministrativesEtFinancieres',
    ];
    const duree = 'moinsDe12h';
    const ouvertureSysteme = 'accessibleSurInternet';
    const volume = 'moyen';

    expect(
      DescriptionServiceV2.niveauSecuriteMinimalRequis({
        audienceCible,
        autresDonneesTraitees: [],
        categories,
        disponibilite: duree,
        ouvertureSysteme,
        volumetrie: volume,
      })
    ).toBe('niveau2');

    const cas2 = uneDescriptionV2Valide()
      .avecCategoriesDonneesTraitees(categories)
      .avecVolumeDonneesTraitees(volume)
      .avecLocalisationDonneesTraitees('UE')
      .avecDureeDysfonctionnementAcceptable(duree)
      .avecAudienceCible(audienceCible)
      .avecOuvertureSysteme(ouvertureSysteme)
      .avecSpecificitesProjet([])
      .avecTypesService([
        'applicationMobile',
        'portailInformation',
        'serviceEnLigne',
      ])
      .avecTypeHebergement('saas')
      .quiExternalise(['administrationTechnique', 'developpementLogiciel']);

    const mesures = moteur.mesures(
      cas2.avecNiveauSecurite('niveau2').construis()
    );

    expect(justeLaMesureEtSonChampIndispensable(mesures)).toEqual(mesuresCas2);
  });

  it('vérifie le cas numéro 3', async () => {
    const audienceCible = 'moyenne';
    const donneesTraitees: CategorieDonneesTraitees[] = [];
    const autresDonneesTraitees = ['une autre'];
    const duree = 'plusDe24h';
    const ouvertureSysteme = 'internePlusTiers';
    const volume = 'moyen';
    expect(
      DescriptionServiceV2.niveauSecuriteMinimalRequis({
        audienceCible,
        autresDonneesTraitees,
        categories: donneesTraitees,
        disponibilite: duree,
        ouvertureSysteme,
        volumetrie: volume,
      })
    ).toBe('niveau1');

    const cas3 = uneDescriptionV2Valide()
      .avecCategoriesDonneesTraitees(donneesTraitees)
      .avecAutresDonneesTraitees(autresDonneesTraitees)
      .avecVolumeDonneesTraitees(volume)
      .avecLocalisationDonneesTraitees('UE')
      .avecDureeDysfonctionnementAcceptable(duree)
      .avecAudienceCible(audienceCible)
      .avecOuvertureSysteme(ouvertureSysteme)
      .avecSpecificitesProjet([])
      .avecTypesService(['portailInformation'])
      .avecTypeHebergement('onPremise')
      .quiExternalise(['developpementLogiciel']);

    const mesures = moteur.mesures(
      cas3.avecNiveauSecurite('niveau1').construis()
    );

    expect(justeLaMesureEtSonChampIndispensable(mesures)).toEqual(mesuresCas3);
  });
});
