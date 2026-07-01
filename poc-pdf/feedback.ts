import { AdaptateurPdfTypst } from '../src/adaptateurs/adaptateurPdf.typst.js';
import { unServiceV2 } from '../test/constructeurs/constructeurService.js';
import fs from 'node:fs';

const adaptateur = new AdaptateurPdfTypst();

const s = unServiceV2()
  .avecNomService('Mairie de Bordeaux')
  .avecOrganisationResponsable({ siret: 'ABCD', nom: 'ANSSI' })
  .construis();

const labelNiveaux: Record<string, string> = {
  niveau1: 'Basiques',
  niveau2: 'Modérés',
  niveau3: 'Avancés',
};
const niveauSecurite = s.descriptionService.niveauSecurite ?? 'niveau2';
const niveauRecommande = s.estimeNiveauDeSecurite() ?? 'niveau1';

const buffer = await adaptateur.genereSyntheseSecurite({
  nomService: s.nomService(),
  nomEntite: s.descriptionService.organisationResponsable.nom!,
  typeService: s.descriptionTypeService() ?? '',
  localisationDonnees: s.descriptionLocalisationDonnees() ?? '',
  statutDeploiement: s.descriptionStatutDeploiement() ?? '',
  presentation: s.presentation() ?? '',
  niveauSecurite,
  labelNiveauSecurite: labelNiveaux[niveauSecurite] ?? '',
  niveauSuperieurAuxRecommandations: s.niveauSecuriteDepasseRecommandation(),
  labelNiveauRecommande: labelNiveaux[niveauRecommande] ?? '',
});

fs.writeFileSync('pocTypst.pdf', buffer, 'utf8');
console.log('done');

// node --import tsx --watch-path=./poc-pdf --watch-path=src poc-pdf/feedback.ts
