import { Automizer } from 'pptx-automizer';
import {
  AdaptateurPowerpoint,
  DonneesSupportCommissionHomologation,
} from './adaptateurPowerpoint.interface.js';
import { nettoieLArchive } from './automizer/nettoyageDeLArchive.js';
import {
  MODELE,
  NOM_TEMPLATE,
  SLIDE_ANALYSE_DE_RISQUES_COMPLEMENTAIRE,
  SLIDE_HISTORIQUE,
  SLIDE_INTERCALAIRE_HISTORIQUE,
  SLIDE_INTERCALAIRE_RISQUES,
  SLIDE_INTERCALAIRE_SOCLE,
  SLIDE_PERIMETRE_DESCRIPTION_TECHNIQUE,
  SLIDE_PERIMETRE_VUE_FONCTIONNELLE,
  SLIDE_PRESENTATION_DU_SYSTEME,
  SLIDE_SOMMAIRE,
} from './automizer/template.js';
import { ajouteLaCouverture } from './automizer/slides/couverture.js';
import { ajouteLaCompositionDeLaCommission } from './automizer/slides/compositionDeLaCommission.js';
import { ajouteLesPiecesDuDossier } from './automizer/slides/piecesDuDossier.js';
import { ajouteLeContexte } from './automizer/slides/contexte.js';
import {
  ajouteLesBesoinsDeSecurite,
  ILLUSTRATIONS_DES_NIVEAUX,
} from './automizer/slides/besoinsDeSecurite.js';
import { ajouteLaCartographieDesRisques } from './automizer/slides/cartographiesDesRisques.js';
import { ajouteLaDescriptionDesRisques } from './automizer/slides/descriptionDesRisques.js';
import {
  ajouteLIndiceCyber,
  imagesDeLIndiceCyber,
} from './automizer/slides/indiceCyber.js';

export class AdaptateurPowerpointAutomizer implements AdaptateurPowerpoint {
  constructor(private readonly dossierTemplates = 'src/vuesPowerpoint') {}

  async genereSupportCommissionHomologation({
    dateCreation,
    autorite,
    piecesDuDossier,
    contexte,
    besoinsDeSecurite,
    cartographiesDesRisques,
    indiceCyber,
  }: DonneesSupportCommissionHomologation) {
    const imagesIndiceCyber = imagesDeLIndiceCyber(indiceCyber);
    const presentation = new Automizer({
      templateDir: this.dossierTemplates,
      removeExistingSlides: true,
      autoImportSlideMasters: false,
      cleanup: true,
    })
      .loadRoot(NOM_TEMPLATE)
      .load(NOM_TEMPLATE, MODELE)
      .loadMedia(
        ILLUSTRATIONS_DES_NIVEAUX,
        `${this.dossierTemplates}/illustrationsNiveaux`
      )
      .loadMediaBuffer(imagesIndiceCyber.noms, imagesIndiceCyber.images);

    ajouteLaCouverture(presentation, dateCreation);
    presentation.addSlide(MODELE, SLIDE_SOMMAIRE);
    ajouteLaCompositionDeLaCommission(presentation, autorite);
    ajouteLesPiecesDuDossier(presentation, piecesDuDossier);
    presentation.addSlide(MODELE, SLIDE_PRESENTATION_DU_SYSTEME);
    ajouteLeContexte(presentation, contexte);
    presentation.addSlide(MODELE, SLIDE_PERIMETRE_VUE_FONCTIONNELLE);
    presentation.addSlide(MODELE, SLIDE_PERIMETRE_DESCRIPTION_TECHNIQUE);
    ajouteLesBesoinsDeSecurite(presentation, besoinsDeSecurite);
    presentation.addSlide(MODELE, SLIDE_INTERCALAIRE_HISTORIQUE);
    presentation.addSlide(MODELE, SLIDE_HISTORIQUE);
    presentation.addSlide(MODELE, SLIDE_INTERCALAIRE_RISQUES);
    ajouteLaCartographieDesRisques(
      presentation,
      'bruts',
      cartographiesDesRisques.bruts
    );
    ajouteLaDescriptionDesRisques(presentation, cartographiesDesRisques.aDate);
    ajouteLaCartographieDesRisques(
      presentation,
      'aDate',
      cartographiesDesRisques.aDate
    );
    ajouteLaCartographieDesRisques(
      presentation,
      'cibles',
      cartographiesDesRisques.cibles
    );
    presentation.addSlide(MODELE, SLIDE_ANALYSE_DE_RISQUES_COMPLEMENTAIRE);
    presentation.addSlide(MODELE, SLIDE_INTERCALAIRE_SOCLE);
    ajouteLIndiceCyber(presentation, indiceCyber);

    const archive = await presentation.getJSZip();
    await nettoieLArchive(archive);
    return archive.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });
  }
}
