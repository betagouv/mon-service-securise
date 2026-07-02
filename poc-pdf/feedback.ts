import { AdaptateurPdfTypst } from '../src/adaptateurs/adaptateurPdf.typst.js';
import { unServiceV2 } from '../test/constructeurs/constructeurService.js';
import fs from 'node:fs';
import { fabriqueReferentiel } from '../src/fabriqueReferentiel.js';
import { uneDescriptionV2Valide } from '../test/constructeurs/constructeurDescriptionServiceV2.js';
import Service from '../src/modeles/service.js';
import { unUUIDRandom } from '../test/constructeurs/UUID.js';

const adaptateur = new AdaptateurPdfTypst();

const referentiel = fabriqueReferentiel().v2();

const donneesService = unServiceV2(referentiel)
  .avecDescription(
    uneDescriptionV2Valide()
      .avecTypesService(['autreSystemeInformation'])
      .avecTypeHebergement('autre')
      .quiExternalise(['administrationTechnique'])
      .avecAudienceCible('tresLarge')
      .avecDonneesTraitees(
        [
          'secretsDEntreprise',
          'documentsRHSensibles',
          'donneesAdministrativesEtFinancieres',
          'donneesCaracterePersonnelPersonneARisque',
        ],
        []
      )
      .avecOuvertureSysteme('accessibleSurInternet')
      .avecVolumeDonneesTraitees('tresEleve')
      .avecNiveauSecurite('niveau3')
      .donneesDescription()
  )
  .avecNomService('Mairie de Bordeaux')
  .avecOrganisationResponsable({ siret: 'ABCD', nom: 'ANSSI' }).donnees;
const mesures = {
  mesuresGenerales: [
    { id: 'RECENSEMENT.1', statut: 'fait', modalites: 'Mon commentaire' },
    { id: 'RECENSEMENT.2', statut: 'fait', modalites: 'Mon commentaire' },
    { id: 'RECENSEMENT.3', statut: 'fait', modalites: 'Mon commentaire' },
    { id: 'CONFORMITE.1', statut: 'nonFait', modalites: 'Mon commentaire' },
    { id: 'CONFORMITE.3', statut: 'nonFait', modalites: 'Mon commentaire' },
    { id: 'ECOSYSTEME.1', statut: 'aLancer', modalites: 'Mon commentaire' },
    { id: 'ECOSYSTEME.2', statut: 'aLancer', modalites: 'Mon commentaire' },
    { id: 'ECOSYSTEME.3', statut: 'aLancer', modalites: 'Mon commentaire' },
    { id: 'ECOSYSTEME.4', statut: 'enCours', modalites: 'Mon commentaire' },
    { id: 'ECOSYSTEME.5', statut: 'enCours', modalites: 'Mon commentaire' },
    { id: 'ECOSYSTEME.6', statut: 'enCours', modalites: 'Mon commentaire' },
  ],
  mesuresSpecifiques: [
    { id: unUUIDRandom(), statut: 'fait', categorie: 'gouvernance' },
  ],
};
const service = new Service(
  {
    ...donneesService,
    ...mesures,
  },
  referentiel
);

const buffer = await adaptateur.genereSyntheseSecurite({ service });

fs.writeFileSync('pocTypst.pdf', buffer, 'utf8');
console.log('done');

// node --import tsx --watch-path=./poc-pdf --watch-path=src poc-pdf/feedback.ts
