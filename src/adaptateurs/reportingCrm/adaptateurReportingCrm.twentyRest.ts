import {
  AdaptateurReportingCrm,
  CrmImportEnMasse,
  HistorisationNombreDeServices,
  IdEntiteCRM,
} from './adaptateurReportingCrm.interface.js';
import Entite from '../../modeles/entite.js';
import { ClientHttpCrm } from './clientHttpCrm.js';

// Oui, il y a bien 2 "s" à la fin : Twenty ajoute un "s" au nom des objets pour former leur pluriel.
const OBJETS_TWENTY = {
  importsDeServices: 'donneesMssImportsDeServicess',
  entitesUtilisatrices: 'donneesMssEntitesUtilisatricess',
  utilisateursInscrits: 'donneesMssUtilisateursInscritss',
  historisationsDuNombreDeServices:
    'donneesMssHistorisationDuNombreDeServicess',
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

  async consigneNombreDeServicesEnProprietaire(
    email: string,
    nombreDeServicesEnProprietaire: number
  ): Promise<void> {
    const idUtilisateur = await this.idUtilisateurExistant(email);
    if (!idUtilisateur) return;

    await this.client.patch(
      `/rest/${OBJETS_TWENTY.utilisateursInscrits}/${idUtilisateur}`,
      { nbServicesEnProprietaire: nombreDeServicesEnProprietaire }
    );
  }

  async historiseNombreDeServices(
    historisations: HistorisationNombreDeServices[]
  ): Promise<void> {
    const sirets = historisations.map(({ siret }) => siret);
    const idsCrmParSiret = await this.idsEntitesExistantes(sirets);
    const dateHistorisation = new Date().toISOString();

    const enregistrements = historisations
      .filter(({ siret }) => idsCrmParSiret.has(siret))
      .map(({ siret, nombreDeServices }) => ({
        dateHistorisation,
        entiteMssId: idsCrmParSiret.get(siret),
        nombreDeServices,
      }));

    await this.client.postBatch(
      `/rest/batch/${OBJETS_TWENTY.historisationsDuNombreDeServices}`,
      enregistrements
    );
  }

  async idsEntitesExistantes(
    sirets: string[]
  ): Promise<Map<string, IdEntiteCRM>> {
    const reponses = await this.client.getBatch(
      `/rest/${OBJETS_TWENTY.entitesUtilisatrices}`,
      sirets,
      (lot) => ({
        filter: `siret[in]:[${lot.map((siret) => `"${siret}"`).join(',')}]`,
      })
    );
    const entites: { id: IdEntiteCRM; siret: string }[] = reponses.flatMap(
      (reponse) => reponse.data.data[OBJETS_TWENTY.entitesUtilisatrices]
    );

    return new Map(entites.map(({ id, siret }) => [siret, id]));
  }

  private async utilisateurExiste(email: string): Promise<boolean> {
    return !!(await this.idUtilisateurExistant(email));
  }

  private async idUtilisateurExistant(
    email: string
  ): Promise<string | undefined> {
    const reponse = await this.client.get(
      `/rest/${OBJETS_TWENTY.utilisateursInscrits}`,
      { filter: `name[eq]:"${email}"` }
    );
    const [utilisateurExistant] =
      reponse.data.data[OBJETS_TWENTY.utilisateursInscrits];
    return utilisateurExistant?.id;
  }
}
