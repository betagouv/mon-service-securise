import Service from '../service.js';
import { Autorisation } from '../autorisations/autorisation.js';
import * as objetGetMesures from './objetGetMesures.js';
import { Droits } from '../autorisations/gestionDroits.js';
import RisqueGeneral from '../risqueGeneral.js';
import { TousReferentiels } from '../../referentiel.interface.js';
import { ObjetGetContactsUtiles } from './objetGetContactsUtiles.js';
import { IdReferentielMesure } from '../../referentiel.types.js';

const {
  DROITS_VOIR_DESCRIPTION,
  DROITS_VOIR_MESURES,
  DROITS_VOIR_RISQUES,
  DROITS_VOIR_CONTACTS_UTILES,
  DROITS_VOIR_INDICE_CYBER,
  DROITS_VOIR_HOMOLOGUER,
} = Autorisation;

type RisquesAPI = {
  risquesGeneraux: Array<Record<string, unknown>>;
  risquesSpecifiques: Array<Record<string, unknown>>;
};

export class ObjetGetServiceComplet {
  constructor(
    private readonly service: Service,
    private readonly autorisation: Autorisation,
    private readonly referentiel: TousReferentiels
  ) {}

  donnees(): {
    descriptionService?: Record<string, unknown>;
    mesures?: Record<string, unknown>;
    risques?: RisquesAPI;
    contactsUtiles?: Record<string, unknown>;
    indicesCyber?: Record<string, unknown>;
    dossiers?: Record<string, unknown>;
  } {
    const { risquesGeneraux, risquesSpecifiques } =
      this.service.risques.toJSON() as RisquesAPI;
    const risquesGenerauxAConsiderer = Object.keys(this.referentiel.risques())
      .map((id) => risquesGeneraux.find((r) => r.id === id) || { id })
      .map((donnees) => new RisqueGeneral(donnees, this.referentiel).toJSON());

    const referentielsMesureConcernes =
      this.referentiel.formatteListeDeReferentiels(
        Object.entries(
          this.service.mesures.enrichiesAvecDonneesPersonnalisees()
            .mesuresGenerales
        ).map(
          ([, mesure]) =>
            (mesure as { referentiel: IdReferentielMesure }).referentiel
        )
      );
    const indiceCyberAnssi = this.service.indiceCyber();
    const indiceCyberPersonnalise = this.service.indiceCyberPersonnalise();

    const dossierCourant = this.service.dossiers.dossierCourant();
    const dossierActif = this.service.dossiers.dossierActif();
    const dossiersPasses = this.service.dossiers.archives();
    const dossiersRefuses = this.service.dossiers.refuses();
    const aucunDossier =
      !dossierCourant &&
      !dossierActif &&
      !dossiersPasses.length &&
      !dossiersRefuses.length;

    return {
      ...(this.peut(DROITS_VOIR_DESCRIPTION) && {
        descriptionService: this.service.descriptionService.toJSON(),
      }),
      ...(this.peut(DROITS_VOIR_MESURES) && {
        mesures: objetGetMesures.donnees(this.service),
      }),
      ...(this.peut(DROITS_VOIR_RISQUES) && {
        risques: {
          risquesGeneraux: risquesGenerauxAConsiderer,
          risquesSpecifiques,
        },
      }),
      ...(this.peut(DROITS_VOIR_CONTACTS_UTILES) && {
        contactsUtiles: new ObjetGetContactsUtiles(this.service).donnees(),
      }),
      ...(this.peut(DROITS_VOIR_INDICE_CYBER) && {
        indicesCyber: {
          indiceCyberAnssi,
          indiceCyberPersonnalise,
          referentielsMesureConcernes,
          nombreMesuresSpecifiques: this.service.nombreMesuresSpecifiques(),
          nombreMesuresNonFait: this.service.nombreTotalMesuresNonFait(),
          tranches: {
            indiceCyber: {
              valeurs: this.referentiel.trancheIndiceCyber(
                indiceCyberAnssi.total
              ),
              descriptions: this.referentiel.descriptionsTranchesIndiceCyber(
                indiceCyberAnssi.total
              ),
            },
            indiceCyberPersonnalise: {
              valeurs: this.referentiel.trancheIndiceCyber(
                indiceCyberPersonnalise.total
              ),
              descriptions: this.referentiel.descriptionsTranchesIndiceCyber(
                indiceCyberAnssi.total
              ),
            },
          },
        },
      }),
      ...(this.peut(DROITS_VOIR_HOMOLOGUER) && {
        dossiers: {
          dossierCourant,
          dossierActif,
          dossiersPasses,
          dossiersRefuses,
          aucunDossier,
        },
      }),
    };
  }

  private peut(droits: Partial<Droits>) {
    return this.autorisation.aLesPermissions(droits);
  }
}
