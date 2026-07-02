import fs from 'node:fs';
import { AdaptateurPdfTypst } from '../src/adaptateurs/adaptateurPdf.typst.js';
import {
  unService,
  unServiceV2,
} from '../test/constructeurs/constructeurService.js';
import Service from '../src/modeles/service.js';
import uneDescriptionValide from '../test/constructeurs/constructeurDescriptionService.js';
import { creeReferentiel } from '../src/referentiel.js';
import { uneDescriptionV2Valide } from '../test/constructeurs/constructeurDescriptionServiceV2.js';
import Mesures from '../src/modeles/mesures.js';
import { creeReferentielV2 } from '../src/referentielV2.js';
import {
  Referentiel,
  ReferentielV2,
  TousReferentiels,
} from '../src/referentiel.interface.js';
import { DonneesRisqueGeneral } from '../src/modeles/risqueGeneral.js';
import { DonneesRisqueSpecifique } from '../src/modeles/risqueSpecifique.js';
import { unUUID } from '../test/constructeurs/UUID.js';
import Risques from '../src/modeles/risques.js';

const adaptateur = new AdaptateurPdfTypst();

const faisUneAnnexe = async (
  service: Service,
  options: { referentiel: TousReferentiels; versionPdfRisques: 'v1' | 'v2' }
) => {
  const donneesDescription = service.vueAnnexePDFDescription().donnees();
  const donneesMesures = service.vueAnnexePDFMesures().donnees();
  const donneesRisques = options.referentiel
    ? service.vueAnnexePDFRisques(options.versionPdfRisques ?? 'v1').donnees()
    : undefined;
  const buffer = await adaptateur.genereAnnexes({
    donneesDescription,
    donneesMesures,
    donneesRisques,
    referentiel: options.referentiel,
    versionPdfRisques: options.versionPdfRisques,
  });
  fs.writeFileSync(`pocTypst_service_${service.version()}.pdf`, buffer, 'utf8');
};

const r2 = creeReferentielV2();
const serviceV2 = unServiceV2(r2)
  .avecDescription(
    uneDescriptionV2Valide()
      .avecNomService('V2 - Bibliothèque')
      .avecStatutDeploiement('enProjet')
      .avecPresentation('La bibliothèque de …')
      .avecPointsAcces(['https://a.fr', 'https://b.fr'])
      .avecSpecificitesProjet([
        'accesPhysiqueAuxBureaux',
        'accesPhysiqueAuxSallesTechniques',
      ])
      .construis()
      .toJSON()
  )
  .avecOrganisationResponsable({ siret: 'ABCD', nom: 'ANSSI' })
  .avecMesures(
    new Mesures(
      {
        mesuresGenerales: [
          {
            id: 'RECENSEMENT.1',
            statut: 'nonFait',
            commentaire: 'je vais le faire',
          },
          {
            id: 'RECENSEMENT.2',
            statut: 'nonFait',
            commentaire: 'je vais le faire',
          },
          { id: 'RECENSEMENT.3', statut: 'enCours' },
          { id: 'CONFORMITE.1', statut: 'nonFait' },
          { id: 'CONFORMITE.3', statut: 'aLancer' },
          { id: 'DEV.1', statut: 'fait' },
        ],
      },
      r2 as unknown as Referentiel,
      {
        'RECENSEMENT.1': { categorie: 'gouvernance' },
        'RECENSEMENT.2': { categorie: 'resilience' },
        'RECENSEMENT.3': { categorie: 'resilience' },
        'CONFORMITE.1': { categorie: 'resilience' },
        'CONFORMITE.3': { categorie: 'resilience' },
        'DEV.1': { categorie: 'resilience' },
      }
    )
  )
  .avecRisquesV2({
    risquesGeneraux: {
      R2: { desactive: false, commentaire: 'un commentaire' },
      R4: { desactive: false },
      R5: {
        desactive: false,
        graviteSurchargee: 3,
        commentaire: 'je vais le faire',
      },
      R6: {},
      R12: { desactive: false },
      R13: { desactive: true },
    },
    risquesSpecifiques: [
      {
        id: 'a99aa881-0c03-4a7b-90b3-0b908a33d727',
        intitule: 'Un risque spé',
        description: '',
        categories: ['disponibilite'],
        risqueBrut: { gravite: 1, vraisemblance: 1 },
        gravite: 1,
        vraisemblance: 1,
        commentaire: 'efazf',
      },
    ],
  })
  .construis();

await faisUneAnnexe(serviceV2, {
  referentiel: r2 as ReferentielV2,
  versionPdfRisques: 'v2',
});

const referentiel = creeReferentiel();

const risquesGeneraux: DonneesRisqueGeneral[] = [
  {
    id: 'indisponibiliteService',
    niveauGravite: 'minime',
    niveauVraisemblance: 'tresVraisemblable',
    commentaire: '',
  },
  {
    id: 'donneesModifiees',
    niveauGravite: 'grave',
    niveauVraisemblance: 'quasiCertain',
    commentaire: '',
  },
  {
    id: 'logicielsMalveillants',
    niveauGravite: '',

    // @ts-ignore
    niveauVraisemblance: '',
    commentaire: '',
    desactive: true,
  },
];
const risquesSpecifiques: DonneesRisqueSpecifique[] = [
  {
    id: unUUID('1'),
    niveauGravite: 'minime',
    niveauVraisemblance: 'vraisemblable',
    intitule: 'Un risque spé',
    identifiantNumerique: 'RS1',
    commentaire: 'commentaire',
    description: 'description',
    categories: ['disponibilite', 'integrite'],
  },
];

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
    .avecMesures(
      new Mesures(
        { mesuresGenerales: [{ id: 'analyseRisques', statut: 'fait' }] },
        referentiel,
        {
          analyseRisques: { categorie: 'gouvernance', referentiel: 'ANSSI' },
          auditsSecurite: { categorie: 'gouvernance', referentiel: 'ANSSI' },
          verificationAutomatique: {
            categorie: 'gouvernance',
            referentiel: 'CNIL',
          },
        }
      )
    )
    .avecRisques(
      new Risques({ risquesGeneraux, risquesSpecifiques }, referentiel)
    )
    .avecOrganisationResponsable({ siret: 'ABCD', nom: 'ANSSI' })
    .construis(),
  { referentiel, versionPdfRisques: 'v1' }
);

// node --import tsx --watch-path=./poc-pdf --watch-path=src poc-pdf/feedback.ts
