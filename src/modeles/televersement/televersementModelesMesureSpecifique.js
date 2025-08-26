import * as Referentiel from '../../referentiel.js';

const chainesSontIdentiques = (a, b) =>
  a.localeCompare(b, 'fr', { sensitivity: 'base' }) === 0;

class TeleversementModelesMesureSpecifique {
  constructor(
    donnees,
    configuration,
    referentiel = Referentiel.creeReferentielVide()
  ) {
    this.modelesTeleverses = donnees;
    this.nbMaximumLignesAutorisees = configuration.nbMaximumLignesAutorisees;
    this.referentiel = referentiel;
  }

  rapportDetaille() {
    const modelesTeleverses = this.modelesTeleverses.map((m, idx) => ({
      modele: m,
      erreurs: this.#controleUnModele(
        m,
        this.modelesTeleverses.filter((autre) => autre !== m)
      ),
      numeroLigne: idx + 1,
    }));

    const depassementDuNombreMaximum = this.#controleDepassement();

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

  #controleDepassement() {
    const nombreTeleverse = this.modelesTeleverses.length;
    const nombreMaximum = this.nbMaximumLignesAutorisees;

    return nombreTeleverse > nombreMaximum
      ? { nombreMaximum, nombreTeleverse }
      : null;
  }

  donneesModelesMesureSpecifique() {
    return this.modelesTeleverses.map(
      ({ descriptionLongue, description, categorie: libelleCategorie }) => ({
        description,
        ...(descriptionLongue && { descriptionLongue }),
        categorie:
          this.referentiel.categorieMesureParLabel(libelleCategorie)[0],
      })
    );
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

export default TeleversementModelesMesureSpecifique;
