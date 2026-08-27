import {
  CanalDiffusion,
  NotificationDuCentre,
  SourceNotifications,
  StatutLecture,
  TypeNotification,
} from '../notification.types.js';
import { TousReferentiels } from '../../referentiel.interface.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { UUID } from '../../typesBasiques.js';
import { IdNatureTacheService } from '../../referentiel.types.js';
import Service from '../../modeles/service.js';

type DonneesUtilisateurTacheService = {
  id: UUID;
  dateFaite?: Date;
  nature: IdNatureTacheService;
  service: Service;
  donnees: Record<string, unknown>;
  dateCreation: Date;
};

type DonneesTacheService = DonneesUtilisateurTacheService & {
  entete: string;
  titreCta: string;
  titre: string;
  lien: string;
  canalDiffusion: CanalDiffusion;
};

export class SourceTachesService implements SourceNotifications {
  constructor(
    private readonly referentiel: TousReferentiels,
    private readonly depotDonnees: DepotDonnees
  ) {}

  async notificationsPour(
    idUtilisateur: UUID
  ): Promise<NotificationDuCentre[]> {
    const tachesPersistees: DonneesUtilisateurTacheService[] =
      await this.depotDonnees.tachesDesServices(idUtilisateur);

    const taches: DonneesTacheService[] = tachesPersistees
      .filter((tache) => !tache.dateFaite)
      .map((tache) => ({
        ...tache,
        ...this.referentiel.natureTachesService(tache.nature),
        canalDiffusion: 'centreNotifications',
      }));

    return (
      taches
        .map((tache) => ({
          ...tache,
          titre: SourceTachesService.titreFusionne(tache),
          lien: tache.lien.replace('%ID_SERVICE%', tache.service.id),
          statutLecture: tache.dateFaite
            ? StatutLecture.lue
            : StatutLecture.nonLue,
          type: 'tache' as TypeNotification,
          doitNotifierLecture: true,
          date: () => tache.dateCreation,
          horodatage: tache.dateCreation,
        }))
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(({ service: _service, ...tache }) => tache)
    );
  }

  static titreFusionne(tache: DonneesTacheService) {
    const champsDonnees = Object.keys(tache.donnees || {});
    const valeurReelle = (champ: string): string => {
      if (champ === 'NOM_SERVICE') return tache.service?.nomService();
      return tache.donnees?.[champ] as string;
    };

    return ['NOM_SERVICE', ...champsDonnees].reduce(
      (acc, cle) => acc.replace(`%${cle}%`, valeurReelle(cle)),
      tache.titre
    );
  }
}
