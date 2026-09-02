import {
  CanalDiffusion,
  Notification,
  SourceNotifications,
  StatutLecture,
} from '../notification.types.js';
import { TousReferentiels } from '../../referentiel.interface.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { UUID } from '../../typesBasiques.js';
import { AdaptateurHorloge } from '../../adaptateurs/adaptateurHorloge.js';
import { IdNouvelleFonctionnalite } from '../../referentiel.types.js';

type DonneesNouveaute = {
  id: IdNouvelleFonctionnalite;
  dateDeDeploiement: string;
  lien: string;
  titre: string;
  sousTitre: string;
  image: string;
  canalDiffusion: CanalDiffusion;
  titreCta: string;
};

type NotificationNouveaute = {
  id: IdNouvelleFonctionnalite;
  lue: boolean;
  supprimee: boolean;
};

export class SourceNouveautes implements SourceNotifications {
  constructor(
    private readonly referentiel: TousReferentiels,
    private readonly depotDonnees: DepotDonnees,
    private readonly adaptateurHorloge: AdaptateurHorloge
  ) {}

  async notificationsPour(idUtilisateur: UUID): Promise<Notification[]> {
    const avant: Readonly<DonneesNouveaute[]> =
      this.referentiel.nouvellesFonctionnalites();

    const utilisateur = await this.depotDonnees.utilisateur(idUtilisateur);

    const toutesNouveautes = avant.filter(
      (n) =>
        new Date(n.dateDeDeploiement) <= this.adaptateurHorloge.maintenant() &&
        new Date(n.dateDeDeploiement) >=
          new Date(utilisateur?.dateCreation ?? 0)
    );

    const toutesNouveautesPersistees: NotificationNouveaute[] =
      await this.depotDonnees.nouveautesPourUtilisateur(idUtilisateur);
    const etatLectureNouveautes = new Map(
      toutesNouveautesPersistees.map((n) => [n.id, n])
    );

    return toutesNouveautes
      .filter((n) => !etatLectureNouveautes.get(n.id)?.supprimee)
      .map((n) => ({
        ...n,
        statutLecture: etatLectureNouveautes.get(n.id)?.lue
          ? StatutLecture.lue
          : StatutLecture.nonLue,
        type: 'nouveaute',
        doitNotifierLecture: true,
        supprimable: true,
        date: () => new Date(n.dateDeDeploiement),
        horodatage: new Date(n.dateDeDeploiement),
      }));
  }
}
