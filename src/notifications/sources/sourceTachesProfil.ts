import {
  Notification,
  SourceNotifications,
  StatutLecture,
} from '../notification.types.js';
import { TousReferentiels } from '../../referentiel.interface.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { AdaptateurHorloge } from '../../adaptateurs/adaptateurHorloge.js';
import { UUID } from '../../typesBasiques.js';
import { IdTacheCompletudeProfil } from '../../referentiel.types.js';

type DonneesTacheProfil = {
  id: IdTacheCompletudeProfil;
  lien: string;
  entete: string;
  titre: string;
  titreCta: string;
};

export class SourceTachesProfil implements SourceNotifications {
  constructor(
    private readonly referentiel: TousReferentiels,
    private readonly depotDonnees: DepotDonnees,
    private readonly adaptateurHorloge: AdaptateurHorloge
  ) {}

  async notificationsPour(idUtilisateur: UUID): Promise<Notification[]> {
    const utilisateur = await this.depotDonnees.utilisateur(idUtilisateur);
    if (!utilisateur) return [];

    const completudeProfil = utilisateur.completudeProfil();
    if (completudeProfil.estComplet) return [];

    const profilDeInvite = completudeProfil.champsNonRenseignes.includes('nom');

    const tachesAFaire = (
      profilDeInvite
        ? [
            this.referentiel.tacheCompletudeProfil(
              'profil'
            ) as DonneesTacheProfil,
          ]
        : completudeProfil.champsNonRenseignes.map((champ) =>
            this.referentiel.tacheCompletudeProfil(
              champ as IdTacheCompletudeProfil
            )
          )
    ).filter((t) => t !== undefined) as DonneesTacheProfil[];

    return tachesAFaire.map(({ entete, ...t }) => ({
      ...t,
      titre: entete,
      sousTitre: t.titre,
      statutLecture: StatutLecture.nonLue,
      canalDiffusion: 'centreNotifications',
      type: 'tache',
      date: () => this.adaptateurHorloge.maintenant(),
      doitNotifierLecture: false,
      supprimable: false,
    }));
  }
}
