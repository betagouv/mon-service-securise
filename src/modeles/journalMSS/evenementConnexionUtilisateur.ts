import Evenement, { Hacheur } from './evenement.js';
import { ErreurDateDerniereConnexionInvalide } from './erreurs.js';
import { UUID } from '../../typesBasiques.js';
import { SourceAuthentification } from '../sourceAuthentification.js';

type Donnees = {
  idUtilisateur: UUID;
  dateDerniereConnexion: string;
  source: SourceAuthentification;
  connexionAvecMFA: boolean;
};

class EvenementConnexionUtilisateur extends Evenement<Donnees> {
  protected override typeEvenement() {
    return 'CONNEXION_UTILISATEUR';
  }

  protected override proprietesRequises(): (keyof Donnees)[] {
    return [
      'connexionAvecMFA',
      'idUtilisateur',
      'dateDerniereConnexion',
      'source',
    ];
  }

  protected override valide(donnees: Donnees) {
    super.valide(donnees);

    if (Number.isNaN(new Date(donnees.dateDerniereConnexion).valueOf()))
      throw new ErreurDateDerniereConnexionInvalide();
  }

  protected override donneesAConsigner(
    { connexionAvecMFA, idUtilisateur, dateDerniereConnexion, source }: Donnees,
    hache: Hacheur
  ) {
    return {
      connexionAvecMFA,
      dateDerniereConnexion,
      idUtilisateur: hache(idUtilisateur),
      source,
    };
  }
}

export default EvenementConnexionUtilisateur;
