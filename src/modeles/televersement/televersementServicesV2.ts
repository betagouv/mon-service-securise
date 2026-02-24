import EvenementServicesImportes from '../../bus/evenementServicesImportes.js';
import EvenementDossierHomologationImporte from '../../bus/evenementDossierHomologationImporte.js';
import {
  DonneesServiceTeleverseV2,
  ServiceTeleverseV2,
} from './serviceTeleverseV2.js';
import { ReferentielV2 } from '../../referentiel.interface.js';
import { UUID } from '../../typesBasiques.js';
import Dossier from '../dossier.js';
import BusEvenements from '../../bus/busEvenements.js';
import { VersionService } from '../versionService.js';
import Service from '../service.js';
import { DureeValidite } from '../etapes/decision.js';

const STATUT = {
  INVALIDE: 'INVALIDE',
  VALIDE: 'VALIDE',
};

export interface DepotPourTeleversementServices {
  services: (idUtilisateur: UUID) => Promise<Service[]>;
  nouveauService: (
    idUtilisateur: UUID,
    donnees: {
      descriptionService: Record<string, unknown>;
      versionService: VersionService.v2;
    }
  ) => Promise<UUID>;
  ajouteSuggestionAction: (
    idService: UUID,
    typeSuggestion: string
  ) => Promise<void>;
  ajouteDossierCourantSiNecessaire: (idService: UUID) => Promise<Dossier>;
  enregistreDossier: (idService: UUID, dossier: Dossier) => Promise<void>;
  metsAJourProgressionTeleversement: (
    idUtilisateur: UUID,
    nouvelleProgression: number
  ) => Promise<void>;
}

class TeleversementServicesV2 {
  private readonly services: ServiceTeleverseV2[];

  constructor(
    donnees: { services: DonneesServiceTeleverseV2[] },
    referentiel: ReferentielV2
  ) {
    const { services } = donnees;
    this.services = services.map(
      (service) => new ServiceTeleverseV2(service, referentiel)
    );
  }

  private valide(nomServicesExistants: string[] = []): Array<string[]> {
    const nomsAggreges = [...nomServicesExistants];
    return this.services.map((serviceTeleverse) => {
      const resultat = serviceTeleverse.valide(nomsAggreges);
      nomsAggreges.push(serviceTeleverse.nom());
      return resultat;
    });
  }

  async rapportDetaille(
    idUtilisateur: UUID,
    depotDonnees: DepotPourTeleversementServices
  ) {
    const services = await depotDonnees.services(idUtilisateur);
    const nomServicesExistants = services.map((s) => s.nomService() as string);
    const erreurs = this.valide(nomServicesExistants);
    const statut =
      erreurs.some((e) => e.length) || this.services.length === 0
        ? STATUT.INVALIDE
        : STATUT.VALIDE;
    return {
      statut,
      services: this.services.map((serviceTeleverse, index) => ({
        service: serviceTeleverse.toJSON(),
        erreurs: erreurs[index],
        numeroLigne: index + 1,
      })),
    };
  }

  async creeLesServices(
    idUtilisateur: UUID,
    depotDonnees: DepotPourTeleversementServices,
    busEvenements: BusEvenements
  ) {
    const creeUnService = async (serviceTeleverse: ServiceTeleverseV2) => {
      const { descriptionService, dossier } =
        serviceTeleverse.enDonneesService();
      const idService = await depotDonnees.nouveauService(idUtilisateur, {
        descriptionService,
        versionService: VersionService.v2,
      });

      if (dossier) {
        const { autorite, decision } = dossier;
        const dossierMetier =
          await depotDonnees.ajouteDossierCourantSiNecessaire(idService);
        dossierMetier.enregistreAutoriteHomologation(
          autorite.nom,
          autorite.fonction
        );
        dossierMetier.declareSansAvis();
        dossierMetier.declareSansDocument();
        const dateIso = decision.dateHomologation.toISOString();
        dossierMetier.enregistreDateTelechargement(dateIso);
        dossierMetier.enregistreDecision(
          dateIso,
          decision.dureeValidite as DureeValidite
        );
        dossierMetier.declareImporte();
        await busEvenements.publie(
          new EvenementDossierHomologationImporte({
            idService,
            dossier: dossierMetier,
          })
        );
        dossierMetier.enregistreFinalisation();
        await depotDonnees.enregistreDossier(idService, dossierMetier);
      }

      await depotDonnees.ajouteSuggestionAction(
        idService,
        'finalisationDescriptionServiceImporte'
      );
    };

    let index = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const serviceTeleverse of this.services) {
      // eslint-disable-next-line no-await-in-loop
      await creeUnService(serviceTeleverse);
      // eslint-disable-next-line no-await-in-loop
      await depotDonnees.metsAJourProgressionTeleversement(
        idUtilisateur,
        index
      );
      index += 1;
    }

    await busEvenements.publie(
      new EvenementServicesImportes({
        idUtilisateur,
        nbServicesImportes: this.services.length,
        versionServicesImportes: VersionService.v2,
      })
    );
  }

  nombre() {
    return this.services.length;
  }
}

export default TeleversementServicesV2;
