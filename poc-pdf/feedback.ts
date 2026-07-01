import { AdaptateurPdfTypst } from '../src/adaptateurs/adaptateurPdf.typst.js';
import {
  unService,
  unServiceV2,
} from '../test/constructeurs/constructeurService.js';
import fs from 'node:fs';
import Service from '../src/modeles/service.js';
import uneDescriptionValide from '../test/constructeurs/constructeurDescriptionService.js';
import { creeReferentiel } from '../src/referentiel.js';
import { uneDescriptionV2Valide } from '../test/constructeurs/constructeurDescriptionServiceV2.js';

const adaptateur = new AdaptateurPdfTypst();

const faisUneAnnexe = async (service: Service) => {
  const donneesDescription = service.vueAnnexePDFDescription().donnees();
  console.table(donneesDescription);

  const buffer = await adaptateur.genereAnnexes({ donneesDescription });

  fs.writeFileSync(`pocTypst_service_${service.version()}.pdf`, buffer, 'utf8');
};

await faisUneAnnexe(
  unServiceV2()
    .avecDescription(
      uneDescriptionV2Valide()
        .avecNomService('V2 - Bibliothèque')
        .avecStatutDeploiement('enProjet')
        .avecPresentation('La bibliothèque de …')
        .avecPointsAcces(['https://a.fr', 'https://b.fr'])
        .construis()
        .toJSON()
    )
    .avecOrganisationResponsable({ siret: 'ABCD', nom: 'ANSSI' })
    .construis()
);

const referentiel = creeReferentiel();

await faisUneAnnexe(
  unService(referentiel)
    .avecDescription(
      uneDescriptionValide(referentiel)
        .avecNomService('V1 - Mairie XY')
        .avecFonctionnalites(['questionnaire', 'newsletter'])
        .avecDonneesCaracterePersonnel(['identite', 'document'])
        .avecDelaiAvantImpactCritique('moinsUneHeure')
        .construis()
        .toJSON()
    )
    .avecOrganisationResponsable({ siret: 'ABCD', nom: 'ANSSI' })
    .construis()
);

// node --import tsx --watch-path=./poc-pdf --watch-path=src poc-pdf/feedback.ts
