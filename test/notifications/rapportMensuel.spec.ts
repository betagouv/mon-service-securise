import {
  Configuration,
  RapportMensuel,
} from '../../src/notifications/rapportMensuel.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import { unUtilisateur } from '../constructeurs/constructeurUtilisateur.js';
import { UUID } from '../../src/typesBasiques.ts';
import { unAdminOrganisations } from '../constructeurs/constructeurAdminOrganisations.ts';
import { unSuperviseur } from '../constructeurs/constructeurSuperviseur.ts';
import { unServiceV2 } from '../constructeurs/constructeurService.js';
import fauxAdaptateurChiffrement from '../mocks/adaptateurChiffrement.js';

describe('Le service de rapport mensuel', () => {
  let configuration: Configuration;

  beforeEach(() => {
    configuration = {
      depotDonnees: {
        tousLesAdmins: async () => [
          unAdminOrganisations(unUUID('A'))
            .quiAdministreLesSirets('SIRET-A1')
            .construis(),
        ],
        tousLesSuperviseurs: async () => [
          unSuperviseur(unUUID('S'))
            .quiSuperviseLesSirets('SIRET-S1')
            .construis(),
        ],
        tousLesServicesAvecSirets: async (sirets: string[]) => {
          const services = [];
          if (sirets.includes('SIRET-A1')) {
            services.push(unServiceV2().avecId(unUUID('S1')).construis());
          }
          if (sirets.includes('SIRET-S1')) {
            services.push(unServiceV2().avecId(unUUID('S2')).construis());
            services.push(unServiceV2().avecId(unUUID('S3')).construis());
          }

          if (!services) throw new Error('SIRET inconnu');

          return services;
        },
        utilisateur: async (idUtilisateur: UUID) => {
          if (idUtilisateur === unUUID('A'))
            return unUtilisateur()
              .avecId(idUtilisateur)
              .avecEmail('admin@email.fr')
              .construis();
          if (idUtilisateur === unUUID('S'))
            return unUtilisateur()
              .avecId(idUtilisateur)
              .avecEmail('superviseur@email.fr')
              .construis();

          throw new Error('A ou S attendu');
        },
      },
      adaptateurJournal: {
        servicesCreesDansIntervalle: async (
          idsServicesHaches: string[],
          intervalle: { debut: Date; fin: Date }
        ): Promise<Array<string>> => {
          if (
            intervalle.debut.getTime() !== new Date('2026-10-01').getTime() ||
            intervalle.fin.getTime() !== new Date('2026-10-31').getTime()
          ) {
            throw new Error('Mauvais intervalle');
          }

          if (idsServicesHaches.includes(`${unUUID('S1')}-haché256`))
            return [`${unUUID('S1')}-haché256`];
          if (idsServicesHaches.includes(`${unUUID('S2')}-haché256`))
            return [`${unUUID('S2')}-haché256`, `${unUUID('S3')}-haché256`];

          throw new Error('id service haché attendu');
        },
      },
      adaptateurChiffrement: fauxAdaptateurChiffrement(),
    };
  });

  it('considère tous les admins et les superviseurs', async () => {
    const donnees = await new RapportMensuel(configuration).donnees({
      debut: new Date('2026-10-01'),
      fin: new Date('2026-10-31'),
    });

    expect(donnees).toContainEqual({
      email: 'admin@email.fr',
      nbNouveauxServicesDansPerimetre: 1,
    });
    expect(donnees).toContainEqual({
      email: 'superviseur@email.fr',
      nbNouveauxServicesDansPerimetre: 2,
    });
  });

  it("merge les entités d'un admin qui serait également superviseur", async () => {
    const idCommun = unUUID('A');

    configuration.depotDonnees.tousLesAdmins = async () => [
      unAdminOrganisations(idCommun)
        .quiAdministreLesSirets('SIRET-A1')
        .construis(),
    ];

    configuration.depotDonnees.tousLesSuperviseurs = async () => [
      unSuperviseur(idCommun).quiSuperviseLesSirets('SIRET-S1').construis(),
    ];

    configuration.adaptateurJournal.servicesCreesDansIntervalle = vi.fn(
      async () => []
    );

    await new RapportMensuel(configuration).donnees({
      debut: new Date('2026-10-01'),
      fin: new Date('2026-10-31'),
    });

    expect(
      configuration.adaptateurJournal.servicesCreesDansIntervalle
    ).toHaveBeenCalledWith(
      [
        `${unUUID('S1')}-haché256`,
        `${unUUID('S2')}-haché256`,
        `${unUUID('S3')}-haché256`,
      ],
      { debut: new Date('2026-10-01'), fin: new Date('2026-10-31') }
    );
  });

  it('ignore les utilisateurs qui ont désactivé le rapport mensuel dans leurs préférences', async () => {
    configuration.depotDonnees.utilisateur = async (idUtilisateur: UUID) => {
      if (idUtilisateur === unUUID('A'))
        return unUtilisateur()
          .avecId(idUtilisateur)
          .avecEmail('desactive@email.fr')
          .avecPreferencesDeRecapitulatif({
            nouveauxServicesAjoutesAuPerimetre: false,
          })
          .construis();
      if (idUtilisateur === unUUID('S'))
        return unUtilisateur()
          .avecId(idUtilisateur)
          .avecEmail('active@email.fr')
          .avecPreferencesDeRecapitulatif({
            nouveauxServicesAjoutesAuPerimetre: true,
          })
          .construis();

      throw new Error('A ou S attendu');
    };

    const donnees = await new RapportMensuel(configuration).donnees({
      debut: new Date('2026-10-01'),
      fin: new Date('2026-10-31'),
    });

    expect(donnees).toEqual([
      { email: 'active@email.fr', nbNouveauxServicesDansPerimetre: 2 },
    ]);
  });
});
