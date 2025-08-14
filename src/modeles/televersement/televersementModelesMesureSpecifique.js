const Referentiel = require('../../referentiel');

const chainesSontIdentiques = (a, b) =>
  a.localeCompare(b, 'fr', { sensitivity: 'base' }) === 0;

class TeleversementModelesMesureSpecifique {
  constructor(donnees, referentiel = Referentiel.creeReferentielVide()) {
    this.modelesTeleverses = donnees;
    this.referentiel = referentiel;
  }

  rapportDetaille(utilisateur) {
    const { nbActuelModelesMesureSpecifique } = utilisateur;

    const modelesTeleverses = this.modelesTeleverses.map((m, idx) => ({
      modele: m,
      erreurs: this.#controleUnModele(
        m,
        this.modelesTeleverses.filter((autre) => autre !== m)
      ),
      numeroLigne: idx + 1,
    }));

    const depassementDuNombreMaximum = this.#controleDepassement(
      nbActuelModelesMesureSpecifique
    );

    const statut =
      modelesTeleverses.some((m) => m.erreurs.length > 0) ||
      modelesTeleverses.length === 0 ||
      depassementDuNombreMaximum
        ? 'INVALIDE'
        : 'VALIDE';

    return {
      modelesTeleverses,
      statut,
      depassementDuNombreMaximum,
    };
  }

  #controleDepassement(nbActuel) {
    const nombreSiAccepte = nbActuel + this.modelesTeleverses.length;
    const nombreMaximum =
      this.referentiel.nombreMaximumDeModelesMesureSpecifiqueParUtilisateur();

    return nombreSiAccepte > nombreMaximum
      ? { nombreMaximum, nombreSiAccepte }
      : null;
  }

  // eslint-disable-next-line class-methods-use-this
  #controleUnModele(modele, lesAutresModeles) {
    const erreurs = [];

    if (!modele.description) erreurs.push('INTITULE_MANQUANT');

    if (!this.referentiel.categorieMesureParLabel(modele.categorie))
      erreurs.push('CATEGORIE_INCONNUE');

    if (
      modele.description &&
      lesAutresModeles.some(
        (autre) =>
          autre.description &&
          chainesSontIdentiques(autre.description, modele.description)
      )
    )
      erreurs.push('MESURE_DUPLIQUEE');

    return erreurs;
  }
}

module.exports = TeleversementModelesMesureSpecifique;
