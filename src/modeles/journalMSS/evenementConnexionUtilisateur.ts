import Evenement from './evenement.js';
import { ErreurDateDerniereConnexionInvalide } from './erreurs.js';
import { UUID } from '../../typesBasiques.js';
import { SourceAuthentification } from '../sourceAuthentification.js';

type DonneesEvenementConnexionUtilisateur = {
  idUtilisateur: UUID;
  dateDerniereConnexion: string;
  source: SourceAuthentification;
};

class EvenementConnexionUtilisateur extends Evenement {
  constructor(donnees: DonneesEvenementConnexionUtilisateur, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    const valide = () => {
      Evenement.verifieProprietesRenseignees(donnees, [
        'idUtilisateur',
        'dateDerniereConnexion',
      ]);

      if (Number.isNaN(new Date(donnees.dateDerniereConnexion).valueOf()))
        throw new ErreurDateDerniereConnexionInvalide();
    };

    valide();

    const { idUtilisateur, dateDerniereConnexion, source } = donnees;
    super(
      'CONNEXION_UTILISATEUR',
      {
        dateDerniereConnexion,
        idUtilisateur: adaptateurChiffrement.hacheSha256(idUtilisateur),
        source,
      },
      date
    );
  }
}

export default EvenementConnexionUtilisateur;
