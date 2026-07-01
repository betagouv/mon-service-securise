import { AdaptateurPdfTypst } from '../src/adaptateurs/adaptateurPdf.typst.js';
import { unServiceV2 } from '../test/constructeurs/constructeurService.js';
import fs from 'node:fs';

const adaptateur = new AdaptateurPdfTypst();

const s = unServiceV2()
  .avecNomService('Mairie de Bordeaux')
  .avecOrganisationResponsable({ siret: 'ABCD', nom: 'ANSSI' })
  .construis();

const buffer = await adaptateur.genereSyntheseSecurite({
  nomService: s.nomService(),
  nomEntite: s.descriptionService.organisationResponsable.nom!,
  typeService: s.descriptionTypeService() ?? '',
  localisationDonnees: s.descriptionLocalisationDonnees() ?? '',
  statutDeploiement: s.descriptionStatutDeploiement() ?? '',
  presentation: s.presentation() ?? '',
});

fs.writeFileSync('pocTypst.pdf', buffer, 'utf8');
console.log('done');

// node --import tsx --watch-path=./poc-pdf --watch-path=src poc-pdf/feedback.ts
