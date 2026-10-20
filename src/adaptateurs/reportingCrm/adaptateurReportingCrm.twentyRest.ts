import {
  AdaptateurReportingCrm,
  CrmImportEnMasse,
  IdEntiteCRM,
} from './adaptateurReportingCrm.interface.js';
import Entite from '../../modeles/entite.js';
import { ClientHttpCrm } from './clientHttpCrm.js';

// Oui, il y a bien 2 "s" à la fin : Twenty ajoute un "s" au nom des objets pour former leur pluriel.
const OBJETS_TWENTY = {
  importsDeServices: 'donneesMssImportsDeServicess',
  entitesUtilisatrices: 'donneesMssEntitesUtilisatricess',
  utilisateursInscrits: 'donneesMssUtilisateursInscritss',
} as const;

export class AdaptateurReportingCrmTwentyRest implements AdaptateurReportingCrm {
  private readonly client: ClientHttpCrm;

  constructor(cleApi: string, urlCrm: URL) {
    this.client = new ClientHttpCrm(cleApi, urlCrm);
  }

  async consigneImportEnMasse(data: CrmImportEnMasse): Promise<void> {
    await this.client.post(`/rest/${OBJETS_TWENTY.importsDeServices}`, {
      name: data.emailUtilisateur,
      nombreDeServices: data.nbServices,
    });
  }

  async consigneEntiteUtilisatrice(entite: Entite): Promise<IdEntiteCRM> {
    const idExistant = await this.idEntiteExistante(entite.siret);
    if (idExistant) return idExistant;

    const reponse = await this.client.post(
      `/rest/${OBJETS_TWENTY.entitesUtilisatrices}`,
      { name: entite.nom, siret: entite.siret }
    );
    return reponse.data.data.createDonneesMssEntitesUtilisatrices.id;
  }

  async consigneNombreDeServicesDeLEntite(
    siret: string,
    nombreDeServices: number
  ): Promise<void> {
    const idEntite = await this.idEntiteExistante(siret);
    if (!idEntite) return;

    await this.client.patch(
      `/rest/${OBJETS_TWENTY.entitesUtilisatrices}/${idEntite}`,
      { nombreDeServices }
    );
  }

  async consigneNombreDHomologationsDeLEntite(
    siret: string,
    nombreDHomologations: number
  ): Promise<void> {
    const idEntite = await this.idEntiteExistante(siret);
    if (!idEntite) return;

    await this.client.patch(
      `/rest/${OBJETS_TWENTY.entitesUtilisatrices}/${idEntite}`,
      { nombreDHomologations }
    );
  }

  private async idEntiteExistante(
    siret: string
  ): Promise<IdEntiteCRM | undefined> {
    const reponse = await this.client.get(
      `/rest/${OBJETS_TWENTY.entitesUtilisatrices}`,
      { filter: `siret[eq]:"${siret}"` }
    );
    const [entiteExistante] =
      reponse.data.data[OBJETS_TWENTY.entitesUtilisatrices];
    return entiteExistante?.id;
  }

  async consigneUtilisateur(
    email: string,
    idEntite?: IdEntiteCRM
  ): Promise<void> {
    if (await this.utilisateurExiste(email)) return;

    await this.client.post(`/rest/${OBJETS_TWENTY.utilisateursInscrits}`, {
      name: email,
      entiteId: idEntite,
    });
  }

  private async utilisateurExiste(email: string): Promise<boolean> {
    const reponse = await this.client.get(
      `/rest/${OBJETS_TWENTY.utilisateursInscrits}`,
      { filter: `name[eq]:"${email}"` }
    );
    return reponse.data.data[OBJETS_TWENTY.utilisateursInscrits].length > 0;
  }
}
