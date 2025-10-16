import { beforeEach } from 'vitest';
import { LecteurDeCSVDeReglesV2 } from '../../../src/moteurRegles/v2/parsing/lecteurDeCSVDeReglesV2.js';
import { mesuresV2 } from '../../../donneesReferentielMesuresV2.js';
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
    const constructeurDescriptionServiceV2 = uneDescriptionV2Valide()
      .avecCategoriesDonneesTraitees(['documentsRHSensibles'])
      .avecVolumeDonneesTraitees('eleve')
      .avecLocalisationDonneesTraitees(['horsUE'])
      .avecDureeDysfonctionnementAcceptable('moinsDe12h')
      .avecAudienceCible('limitee')
      .avecOuvertureSysteme('accessibleSurInternet')
      .avecSpecificitesProjet([
        'accesPhysiqueAuxSallesTechniques',
        'annuaire',
        'echangeOuReceptionEmails',
      ])
      .avecTypesService(['serviceEnLigne'])
      .avecTypeHebergement('onPremise')
      .quiExternalise(['administrationTechnique']);

    expect(
      DescriptionServiceV2.niveauSecuriteMinimalRequis(
        constructeurDescriptionServiceV2.donneesDescription()
      )
    ).toBe('niveau3');

    const mesures = moteur.mesures(
      constructeurDescriptionServiceV2.avecNiveauSecurite('niveau3').construis()
    );

    expect(justeLaMesureEtSonChampIndispensable(mesures)).toEqual(mesuresCas1);
  });

  it('vérifie le cas numéro 2', async () => {
    const constructeurDescriptionServiceV2 = uneDescriptionV2Valide()
      .avecCategoriesDonneesTraitees(['donneesAdministrativesEtFinancieres'])
      .avecVolumeDonneesTraitees('moyen')
      .avecLocalisationDonneesTraitees(['UE'])
      .avecDureeDysfonctionnementAcceptable('moinsDe12h')
      .avecAudienceCible('moyenne')
      .avecOuvertureSysteme('accessibleSurInternet')
      .avecSpecificitesProjet([])
      .avecTypesService([
        'applicationMobile',
        'portailInformation',
        'serviceEnLigne',
      ])
      .avecTypeHebergement('saas')
      .quiExternalise(['administrationTechnique', 'developpementLogiciel']);

    expect(
      DescriptionServiceV2.niveauSecuriteMinimalRequis(
        constructeurDescriptionServiceV2.donneesDescription()
      )
    ).toBe('niveau2');

    const mesures = moteur.mesures(
      constructeurDescriptionServiceV2.avecNiveauSecurite('niveau2').construis()
    );

    expect(justeLaMesureEtSonChampIndispensable(mesures)).toEqual(mesuresCas2);
  });

  it('vérifie le cas numéro 3', async () => {
    const constructeurDescriptionServiceV2 = uneDescriptionV2Valide()
      .avecCategoriesDonneesTraitees([])
      .avecAutresDonneesTraitees(['une autre'])
      .avecVolumeDonneesTraitees('moyen')
      .avecLocalisationDonneesTraitees(['UE'])
      .avecDureeDysfonctionnementAcceptable('plusDe24h')
      .avecAudienceCible('moyenne')
      .avecOuvertureSysteme('internePlusTiers')
      .avecSpecificitesProjet([])
      .avecTypesService(['portailInformation'])
      .avecTypeHebergement('onPremise')
      .quiExternalise(['developpementLogiciel']);

    expect(
      DescriptionServiceV2.niveauSecuriteMinimalRequis(
        constructeurDescriptionServiceV2.donneesDescription()
      )
    ).toBe('niveau1');

    const mesures = moteur.mesures(
      constructeurDescriptionServiceV2.avecNiveauSecurite('niveau1').construis()
    );

    expect(justeLaMesureEtSonChampIndispensable(mesures)).toEqual(mesuresCas3);
  });
});
