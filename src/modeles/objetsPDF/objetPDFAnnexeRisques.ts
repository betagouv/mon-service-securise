const Referentiel = require('../../referentiel');

class ObjetPDFAnnexeRisques {
  constructor(homologation, referentiel = Referentiel.creeReferentielVide()) {
    this.referentiel = referentiel;
    this.service = homologation;
    this.risques = [
      ...this.service.risquesGeneraux().tous(),
      ...this.service.risquesSpecifiques().tous(),
    ];
  }

  calculeGrille() {
    const resultat = Array.from({ length: 4 }, () => Array(4).fill(null));

    const positionVraisemblance = (risque) =>
      this.referentiel.niveauxVraisemblance()[risque.niveauVraisemblance]
        .position;

    const positionGravite = (risque) =>
      this.referentiel.niveauxGravite()[risque.niveauGravite].position;

    const risquesCartographies = this.risques.filter(
      (risque) =>
        risque.niveauGravite &&
        risque.niveauVraisemblance &&
        positionVraisemblance(risque) > 0 &&
        positionGravite(risque) > 0
    );

    risquesCartographies.forEach((risque) => {
      const x = positionVraisemblance(risque) - 1;
      const y = Math.abs(4 - positionGravite(risque));
      resultat[y][x] = resultat[y][x] || [];
      resultat[y][x].push(risque.identifiantNumeriqueRisque());
    });
    return resultat;
  }

  donnees() {
    return {
      nomService: this.service.nomService(),
      risques: this.risques.map((r) => r.toJSON()),
      grilleRisques: this.calculeGrille(),
      matriceNiveauxRisque: this.referentiel.matriceNiveauxRisques(),
    };
  }
}

module.exports = ObjetPDFAnnexeRisques;
