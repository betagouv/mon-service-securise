import Mesure from '../../modeles/mesure.js';

type ProprieteMesure = keyof Mesure;

export class ComparateurMesures {
  constructor(
    private readonly ancienneMesure: Mesure,
    private readonly nouvelleMesure: Mesure
  ) {}

  valeursEgales(propriete: ProprieteMesure) {
    if (propriete === 'echeance') {
      return (
        new Date(this.ancienneMesure[propriete] ?? 0).getTime() ===
        new Date(this.nouvelleMesure[propriete] ?? 0).getTime()
      );
    }
    return this.ancienneMesure[propriete] === this.nouvelleMesure[propriete];
  }

  aMisAJour = (propriete: ProprieteMesure) =>
    this.ancienneMesure?.[propriete] &&
    !this.valeursEgales(propriete) &&
    this.nouvelleMesure[propriete];

  aAjoute = (propriete: ProprieteMesure) =>
    !this.ancienneMesure?.[propriete] && this.nouvelleMesure[propriete];

  aSupprime = (propriete: ProprieteMesure) =>
    this.ancienneMesure?.[propriete] && !this.nouvelleMesure[propriete];

  private readonly proprietesUnitaires: ProprieteMesure[] = [
    'statut',
    'priorite',
    'echeance',
  ];

  proprietesMisesAJour = () =>
    this.proprietesUnitaires.filter((p) => this.aMisAJour(p));

  proprietesAjoutees = () =>
    this.proprietesUnitaires.filter((p) => this.aAjoute(p));

  proprietesSupprimees = () =>
    ['echeance' as ProprieteMesure].filter((p) => this.aSupprime(p));

  responsablesDeLancienneMesure = () => this.ancienneMesure?.responsables || [];

  responsablesAjoutes = () =>
    this.nouvelleMesure.responsables.filter(
      (r) => !this.responsablesDeLancienneMesure().includes(r)
    );

  responsablesRetires = () =>
    this.responsablesDeLancienneMesure().filter(
      (r) => !this.nouvelleMesure.responsables.includes(r)
    );
}
