import { AdaptateurPdf } from './adaptateurPdf.interface.js';
import { NodeCompiler } from '@myriaddreamin/typst-ts-node-compiler';
import Service from '../modeles/service.js';
import {
  svgIndiceCyber,
  svgIndiceCyberPersonnalise,
} from './indiceCyberSvg.js';
import { IdCategorieMesure } from '../referentiel.types.js';

const labelNiveaux: Record<string, string> = {
  niveau1: 'Basiques',
  niveau2: 'Modérés',
  niveau3: 'Avancés',
};

const formatteNote = new Intl.NumberFormat('fr', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
}).format;

export type DonneesPdfSyntheseSecurite = {
  nomService: string;
  nomEntite: string;
  typeService: string;
  localisationDonnees: string;
  statutDeploiement: string;
  presentation: string;
  niveauSecurite: string;
  labelNiveauSecurite: string;
  niveauSuperieurAuxRecommandations: boolean;
  labelNiveauRecommande: string;
  svgIndiceCyber: string;
  svgIndiceCyberPersonnalise: string;
  categoriesIndiceCyber: { description: string; note: string | null }[];
  noteMaxIndiceCyber: number;
};

export class AdaptateurPdfTypst implements AdaptateurPdf {
  private readonly compilateur: NodeCompiler;

  constructor() {
    this.compilateur = NodeCompiler.create({
      fontArgs: [{ fontPaths: ['src/vuesPdf/fonts'] }],
    });
  }

  async genereSyntheseSecurite({
    service,
  }: {
    service: Service;
  }): Promise<Buffer<ArrayBuffer>> {
    const niveauSecurite =
      service.descriptionService.niveauSecurite ?? 'niveau2';
    const niveauRecommande = service.estimeNiveauDeSecurite() ?? 'niveau1';
    const { referentiel } = service;
    const noteMax = referentiel.indiceCyberNoteMax();
    const indice = service.indiceCyber();
    const indicePerso = service.indiceCyberPersonnalise();

    const donnees: DonneesPdfSyntheseSecurite = {
      nomService: service.nomService(),
      nomEntite: service.descriptionService.organisationResponsable.nom!,
      typeService: service.descriptionTypeService() ?? '',
      localisationDonnees: service.descriptionLocalisationDonnees() ?? '',
      statutDeploiement: service.descriptionStatutDeploiement() ?? '',
      presentation: service.presentation() ?? '',
      niveauSecurite,
      labelNiveauSecurite: labelNiveaux[niveauSecurite] ?? '',
      niveauSuperieurAuxRecommandations:
        service.niveauSecuriteDepasseRecommandation(),
      labelNiveauRecommande: labelNiveaux[niveauRecommande] ?? '',
      svgIndiceCyber: svgIndiceCyber(indice.total, noteMax),
      svgIndiceCyberPersonnalise: svgIndiceCyberPersonnalise(
        indicePerso.total,
        noteMax
      ),
      categoriesIndiceCyber: referentiel
        .identifiantsCategoriesMesures()
        .map((id: string) => ({
          description: referentiel.descriptionCategorie(
            id as IdCategorieMesure
          ),
          note:
            typeof indice[id] === 'number' ? formatteNote(indice[id]) : null,
        })),
      noteMaxIndiceCyber: noteMax,
    };
    const res = this.compilateur.pdf({
      mainFilePath: 'src/vuesPdf/syntheseSecurite.typ',
      inputs: { payload: JSON.stringify(donnees) },
    });

    return Buffer.from(res);
  }
}
