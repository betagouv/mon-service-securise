import type {
  PagesServiceProps,
  ServicePourPagesService,
} from './pagesService.d';
import type { DescriptionServiceV2API } from '../decrireV2/decrireV2.d';
import { tousRisques } from '../risques/risques';
import type { ContactsUtiles } from './pages/contactsUtiles/contactsUtiles.types';
import type { IndicesCyber } from './pages/indiceCyber/indiceCyber.types';
import type { DossiersHomologation } from './pages/homologuer/homologuer.types';
import type { PageServiceGeree } from './pagesServiceGerees';

export const propsPourPage = (
  page: PageServiceGeree,
  props: PagesServiceProps,
  service: ServicePourPagesService | undefined,
  descriptionService: DescriptionServiceV2API | undefined,
  risques: ReturnType<typeof tousRisques> | undefined,
  contactsUtiles: ContactsUtiles | undefined,
  indicesCyber: IndicesCyber | undefined,
  dossiers: DossiersHomologation | undefined
) => {
  switch (page) {
    case 'mesures':
      return {
        estLectureSeule: props.estLectureSeule.mesures,
        categories: props.referentiel.mesures.categories,
        statuts: props.referentiel.mesures.statuts,
        priorites: props.referentiel.mesures.priorites,
        versionService: service?.version,
        avecRisquesV2: props.featureFlags.avecRisquesV2,
        afficheExplicationRisquesV2:
          props.preferencesUtilisateur.afficheExplicationRisquesV2,
      };
    case 'descriptionService':
      return {
        lectureSeule: props.estLectureSeule.descriptionService,
        descriptionService,
        doitFinaliserDescription:
          props.suggestionsService.finalisationDescriptionServiceImporte,
      };
    case 'risques':
      return {
        estLectureSeule: props.estLectureSeule.risques,
        categoriesRisque: props.referentiel.risques.categories,
        niveauxGravite: props.referentiel.risques.gravites,
        niveauxVraisemblance: props.referentiel.risques.vraisemblances,
        referentielRisques: props.referentiel.risques.descriptions,
        matriceNiveauxRisque: props.referentiel.risques.matrice,
        niveauxRisque: props.referentiel.risques.niveaux,
        risques,
      };
    case 'rolesResponsabilites':
      return {
        contactsUtiles,
      };
    case 'indiceCyber':
      return {
        indiceCyber: indicesCyber?.indiceCyberAnssi,
        indiceCyberPersonnalise: indicesCyber?.indiceCyberPersonnalise,
        noteMax: props.referentiel.indiceCyber.noteMax,
        referentielsMesureConcernes: indicesCyber?.referentielsMesureConcernes,
        nombreMesuresSpecifiques: indicesCyber?.nombreMesuresSpecifiques,
        nombreMesuresNonFait: indicesCyber?.nombreMesuresNonFait,
        categories: props.referentiel.mesures.categories,
        tranches: indicesCyber?.tranches.indiceCyber,
        tranchesPersonnalisees: indicesCyber?.tranches.indiceCyberPersonnalise,
      };
    case 'dossiers':
      return {
        dossiers,
        estLectureSeule: props.estLectureSeule.dossiers,
        statutsHomologation: props.referentiel.dossiers.statutsHomologation,
        indiceCyber: indicesCyber?.indiceCyberAnssi.total,
        indiceCyberPersonnalise: indicesCyber?.indiceCyberPersonnalise.total,
        documentsPdfDisponibles: service?.documentsPdfDisponibles,
        niveauSecurite: descriptionService?.niveauSecurite,
      };
    case 'homologation':
      return {
        dossier: dossiers?.dossierCourant,
        etapesParcours: props.referentiel.dossiers.etapesParcoursHomologation,
        statutsAvisDossierHomologation:
          props.referentiel.dossiers.statutsAvisDossierHomologation,
        echeancesRenouvellement:
          props.referentiel.dossiers.echeancesRenouvellement,
        peutHomologuer: props.peutHomologuer,
        niveauSecurite: descriptionService?.niveauSecurite,
      };
    default:
      return {};
  }
};
