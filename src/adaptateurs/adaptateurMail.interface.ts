import { UUID } from '../typesBasiques.js';

type IdEntreprise = string;

export interface AdaptateurMail {
  creeContact(
    destinataire: string,
    prenom: string,
    nom: string,
    telephone: string,
    bloqueNewsletter: boolean,
    bloqueMarketing: boolean
  ): Promise<void>;

  creeEntreprise(
    siret: string,
    nom: string,
    natureJuridique: string
  ): Promise<IdEntreprise>;

  desinscrisEmailsTransactionnels(destinataire: string): Promise<void>;

  desinscrisInfolettre(destinataire: string): Promise<void>;

  envoieMessageFelicitationHomologation(
    destinataire: string,
    idService: UUID
  ): Promise<void>;

  envoieMessageInvitationContribution(
    destinataire: string,
    prenomNomEmetteur: string,
    nbServices: string
  ): Promise<void>;

  envoieMessageInvitationInscription(
    destinataire: string,
    prenomNomEmetteur: string,
    nbServices: number
  ): Promise<void>;

  envoieNotificationExpirationHomologation(
    destinataire: string,
    idService: UUID,
    delaiAvantExpirationMois: number
  ): Promise<void>;

  envoieMessageNominationAdmin(destinataire: string): Promise<void>;

  inscrisEmailsTransactionnels(destinataire: string): Promise<void>;

  inscrisInfolettre(destinataire: string): Promise<void>;

  metAJourContact(
    destinataire: string,
    prenom: string,
    nom: string,
    telephone: string
  ): Promise<void>;

  metAJourDonneesContact(
    destinataire: string,
    donnees: Record<string, unknown>
  ): Promise<void>;

  recupereEntreprise(siret: string): Promise<IdEntreprise>;

  recupereEntrepriseDuContact(idContact: string): Promise<IdEntreprise>;

  recupereIdentifiantContact(email: string): Promise<string>;

  relieContactAEntreprise(
    idContact: string,
    idEntreprise: IdEntreprise
  ): Promise<void>;

  supprimeContact(email: string): Promise<void>;

  supprimeLienEntreContactEtEntreprise(
    idContact: string,
    idEntreprise: IdEntreprise
  ): Promise<void>;
}
