import Service from '../service.js';
import ActeursHomologation from '../acteursHomologation.js';

type PartiesPrenantes = {
  toJSON: () => Array<{ type: string }>;
};

export class ObjetGetContactsUtiles {
  constructor(private readonly service: Service) {}

  donnees() {
    const {
      autoriteHomologation,
      fonctionAutoriteHomologation,
      expertCybersecurite,
      fonctionExpertCybersecurite,
      delegueProtectionDonnees,
      fonctionDelegueProtectionDonnees,
      piloteProjet,
      fonctionPiloteProjet,
      acteursHomologation,
      partiesPrenantes,
    } = this.service.rolesResponsabilites;

    const mappingPartiesPrenantes = Object.fromEntries(
      (partiesPrenantes as PartiesPrenantes)
        .toJSON()
        .filter((p: { type: string }) => p.type !== 'PartiePrenanteSpecifique')
        .map(({ type, ...donnees }) => [type, donnees])
    );

    const mappingPartiesPrenantesSpecifiques = (
      partiesPrenantes as PartiesPrenantes
    )
      .toJSON()
      .filter((p) => p.type === 'PartiePrenanteSpecifique')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ type, ...donnees }) => donnees);

    return {
      autoriteHomologation: {
        nom: autoriteHomologation,
        fonction: fonctionAutoriteHomologation,
      },
      expertCybersecurite: {
        nom: expertCybersecurite,
        fonction: fonctionExpertCybersecurite,
      },
      delegueProtectionDonnees: {
        nom: delegueProtectionDonnees,
        fonction: fonctionDelegueProtectionDonnees,
      },
      piloteProjet: { nom: piloteProjet, fonction: fonctionPiloteProjet },
      acteursHomologation: (
        acteursHomologation as ActeursHomologation
      ).toJSON(),
      partiesPrenantesSpecifiques: mappingPartiesPrenantesSpecifiques,
      partiesPrenantes: mappingPartiesPrenantes,
    };
  }
}
