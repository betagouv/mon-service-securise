import Evenement, { Hacheur } from './evenement.js';
import { UUID } from '../../typesBasiques.js';

type Donnees = {
  idService: UUID;
  dateHomologation: string;
  dureeHomologationMois?: number;
  refusee?: boolean;
  importe?: boolean;
};

class EvenementNouvelleHomologationCreee extends Evenement<Donnees> {
  protected override typeEvenement() {
    return 'NOUVELLE_HOMOLOGATION_CREEE';
  }

  protected override proprietesRequises({
    refusee,
  }: Donnees): (keyof Donnees)[] {
    return refusee
      ? ['idService', 'dateHomologation']
      : ['idService', 'dateHomologation', 'dureeHomologationMois'];
  }

  protected override donneesAConsigner(
    {
      idService,
      dateHomologation,
      dureeHomologationMois,
      refusee,
      importe,
    }: Donnees,
    hache: Hacheur
  ) {
    return {
      idService: hache(idService),
      dateHomologation,
      dureeHomologationMois,
      ...(refusee && { refusee: true }),
      ...(importe && { importe: true }),
    };
  }
}

export default EvenementNouvelleHomologationCreee;
