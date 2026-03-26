import Mesure from './mesure.js';
import { ErreurMesureInconnue } from '../erreurs.js';

class MesureGenerale extends Mesure {
  constructor(donneesMesure, referentiel) {
    super({
      proprietesAtomiquesRequises: ['id', 'statut'],
      proprietesAtomiquesFacultatives: ['modalites', 'priorite', 'echeance'],
      proprietesListes: ['responsables'],
    });

    MesureGenerale.valide(donneesMesure, referentiel);
    this.renseigneProprietes(donneesMesure);

    this.rendueIndispensable = !!donneesMesure.rendueIndispensable;
    this.referentiel = referentiel;
    this.echeance = donneesMesure.echeance && new Date(donneesMesure.echeance);
  }

  donneesReferentiel() {
    return this.referentiel.mesure(this.id);
  }

  descriptionMesure() {
    return this.donneesReferentiel().description;
  }

  estIndispensable() {
    return (
      !!this.donneesReferentiel().indispensable || this.rendueIndispensable
    );
  }

  estRecommandee() {
    return !this.estIndispensable();
  }

  statutRenseigne() {
    return Mesure.statutRenseigne(this.statut);
  }

  supprimeResponsable(idUtilisateur) {
    this.responsables = this.responsables.filter((r) => r !== idUtilisateur);
  }

  donneesSerialisees() {
    return {
      ...super.donneesSerialisees(),
      ...(this.echeance && { echeance: new Date(this.echeance).toISOString() }),
    };
  }

  static valide({ id, statut, priorite, echeance }, referentiel) {
    super.valide({ statut, priorite, echeance }, referentiel);

    if (!referentiel.estIdentifiantMesureConnu(id)) {
      throw new ErreurMesureInconnue(`La mesure "${id}" n'est pas répertoriée`);
    }
  }
}

export default MesureGenerale;
