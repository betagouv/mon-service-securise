import { Automizer, modify } from 'pptx-automizer';
import {
  AdaptateurPowerpoint,
  DonneesSupportCommissionHomologation,
} from './adaptateurPowerpoint.interface.js';
import { dateEnFrancais } from '../utilitaires/date.js';

const NOM_TEMPLATE = 'supportCommissionHomologation.pptx';
const SLIDE_COUVERTURE = 1;

export class AdaptateurPowerpointAutomizer implements AdaptateurPowerpoint {
  constructor(private readonly dossierTemplates = 'src/vuesPowerpoint') {}

  async genereSupportCommissionHomologation({
    nomService,
    dateCreation,
  }: DonneesSupportCommissionHomologation) {
    const presentation = new Automizer({
      templateDir: this.dossierTemplates,
      removeExistingSlides: true,
      autoImportSlideMasters: false,
      cleanup: true,
    })
      .loadRoot(NOM_TEMPLATE)
      .load(NOM_TEMPLATE, 'modele');

    presentation.addSlide('modele', SLIDE_COUVERTURE, (slide) => {
      slide.modifyElement('nom-service', modify.setText(nomService));
      slide.modifyElement(
        'date-creation',
        modify.replaceText({
          replace: 'dateCreation',
          by: { text: dateEnFrancais(dateCreation) },
        })
      );
    });

    const archive = await presentation.getJSZip();
    return archive.generateAsync({ type: 'nodebuffer' });
  }
}
