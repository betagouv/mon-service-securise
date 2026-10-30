import { RapportMensuel } from '../../src/notifications/rapportMensuel.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import { unUtilisateur } from '../constructeurs/constructeurUtilisateur.js';
import { UUID } from '../../src/typesBasiques.ts';

describe('Le service de rapport mensuel', () => {
  it('considère tous les admins et les superviseurs', async () => {
    const depotDonnees = {
      tousLesIdsAdmins: async () => [unUUID('A')],
      tousLesIdsSuperviseurs: async () => [unUUID('S')],
      utilisateur: async (idUtilisateur: UUID) => {
        if (idUtilisateur === unUUID('A'))
          return unUtilisateur().avecEmail('admin@email.fr').construis();
        if (idUtilisateur === unUUID('S'))
          return unUtilisateur().avecEmail('superviseur@email.fr').construis();

        throw new Error('A ou S attendu');
      },
    };

    const donnees = await new RapportMensuel({ depotDonnees }).donnees();

    expect(donnees).toContainEqual({
      email: 'admin@email.fr',
      nbNouveauxServicesDansPerimetre: 0,
    });
    expect(donnees).toContainEqual({
      email: 'superviseur@email.fr',
      nbNouveauxServicesDansPerimetre: 0,
    });
  });

  it("ne considère qu'une fois un utilisateur à la fois admin et superviseur", async () => {
    const depotDonnees = {
      tousLesIdsAdmins: async () => [unUUID('1')],
      tousLesIdsSuperviseurs: async () => [unUUID('1')],
      utilisateur: async () =>
        unUtilisateur().avecEmail('admin-superviseur@email.fr').construis(),
    };

    const donnees = await new RapportMensuel({ depotDonnees }).donnees();

    expect(donnees).toEqual([
      {
        email: 'admin-superviseur@email.fr',
        nbNouveauxServicesDansPerimetre: 0,
      },
    ]);
  });

  it('ignore les utilisateurs qui ont désactivé le rapport mensuel dans leurs préférences', async () => {
    const depotDonnees = {
      tousLesIdsAdmins: async () => [unUUID('A'), unUUID('B')],
      tousLesIdsSuperviseurs: async () => [],
      utilisateur: async (idUtilisateur: UUID) => {
        if (idUtilisateur === unUUID('A'))
          return unUtilisateur()
            .avecEmail('desactive@email.fr')
            .avecPreferencesDeRecapitulatif({
              nouveauxServicesAjoutesAuPerimetre: false,
            })
            .construis();

        return unUtilisateur()
          .avecEmail('active@email.fr')
          .avecPreferencesDeRecapitulatif({
            nouveauxServicesAjoutesAuPerimetre: true,
          })
          .construis();
      },
    };

    const donnees = await new RapportMensuel({ depotDonnees }).donnees();

    expect(donnees).toEqual([
      { email: 'active@email.fr', nbNouveauxServicesDansPerimetre: 0 },
    ]);
  });
});
