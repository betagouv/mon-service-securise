import { EvenementMetier } from './evenementMetier.js';
import { UUID } from '../typesBasiques.js';

type Donnees = { idUtilisateurDestinataire: UUID; idUtilisateurEmetteur: UUID };

class EvenementInvitationUtilisateurEnvoyee extends EvenementMetier<Donnees>([
  'idUtilisateurDestinataire',
  'idUtilisateurEmetteur',
]) {}

export default EvenementInvitationUtilisateurEnvoyee;
