import { NodeCompiler } from '@myriaddreamin/typst-ts-node-compiler';
import { AdaptateurPdf } from './adaptateurPdf.interface.js';
import Service from '../modeles/service.js';
import { DonneesEtapeAvis } from '../modeles/etapes/etapeAvis.js';
import { DonneesDocuments } from '../modeles/etapes/documents.js';
import Dossier from '../modeles/dossier.js';

const labelNiveaux: Record<string, string> = {
  niveau1: 'Basiques',
  niveau2: 'Modérés',
  niveau3: 'Avancés',
};

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
};

export type DonneesPdfDossierDecision = {
  nomService: string;
  nomPrenomAutorite: string;
  fonctionAutorite: string;
  indiceCyberTotal: number;
  organisationResponsable: string;
} & DonneesEtapeAvis &
  DonneesDocuments;

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
    };
    const res = this.compilateur.pdf({
      mainFilePath: 'src/vuesPdf/syntheseSecurite.typ',
      inputs: { payload: JSON.stringify(donnees) },
    });

    return Buffer.from(res);
  }

  async genereDossierDecision(
    donnees: DonneesPdfDossierDecision
  ): Promise<Buffer<ArrayBuffer>> {
    const res = this.compilateur.pdf({
      mainFilePath: 'src/vuesPdf/dossierDecision.typ',
      inputs: { payload: JSON.stringify(donnees) },
    });

    return Buffer.from(res);
  }
}
