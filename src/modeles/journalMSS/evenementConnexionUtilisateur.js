import Evenement from './evenement.js';
import { ErreurDateDerniereConnexionInvalide } from './erreurs.js';

class EvenementConnexionUtilisateur extends Evenement {
  constructor(donnees, options = {}) {
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

    super(
      'CONNEXION_UTILISATEUR',
      {
        ...donnees,
        idUtilisateur: adaptateurChiffrement.hacheSha256(donnees.idUtilisateur),
      },
      date
    );
  }
}

export default EvenementConnexionUtilisateur;
