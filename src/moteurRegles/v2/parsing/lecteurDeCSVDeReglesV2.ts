import * as fs from 'node:fs';
import Papa from 'papaparse';
import { PathLike } from 'fs';
import {
  ActiviteExternalisee,
  IdMesureV2,
  mesuresV2,
  SpecificiteProjet,
  TypeDeService,
  TypeHebergement,
} from '../../../../donneesReferentielMesuresV2.js';
import { ErreurMoteurDeReglesV2 } from '../../../erreurs.js';
import {
  Modificateur,
  ModificateurPourBesoin,
  ModificateursDeRegles,
  ReglesDuReferentielMesuresV2,
} from '../moteurReglesV2.js';
import { NiveauCriticite } from '../niveauSecurite.js';

const CHAMPS_CONCERNES_MODIFICATEURS = [
  'Données : +',
  'Données : ++',
  'Données : +++',
  'Données : ++++',
  'Données : Hors UE',
  'Dispo : +',
  'Dispo : ++',
  'Dispo : +++',
  'Dispo : ++++',
  'Ouv : +',
  'Ouv : ++',
  'Ouv : +++',
  'Ouv : ++++',
  'Accès physique : Salles techniques',
  'Accès physique : Bureaux',
  'Annuaire',
  'Signature électronique',
  'Application mobile',
  "Echange et/ou réception d'emails",
  'API',
  "Portail d'information",
  'Service en ligne',
  "Autre Système d'information",
  'Poste de travail ou téléphone',
  'EXT : Admin tech',
  'EXT : Dév',
  'EXT : MCO/MCS',
  'EXT : On-premise',
  'EXT : PaaS / IaaS',
  'EXT : SaaS',
] as const;
type ChampsModificateurs = (typeof CHAMPS_CONCERNES_MODIFICATEURS)[number];

type LigneDeCSVTransformee = {
  REF: IdMesureV2;
  'Statut initial': boolean;
  Basique?: ModificateurPourBesoin;
  Modéré?: ModificateurPourBesoin;
  Avancé?: ModificateurPourBesoin;
} & {
  [K in ChampsModificateurs]?: Modificateur[];
};

export class LecteurDeCSVDeReglesV2 {
  private statutsInitiaux = { Présente: true, Absente: false };

  // eslint-disable-next-line no-empty-function
  constructor(private readonly referentielMesures: typeof mesuresV2) {}

  lis(cheminCSV: PathLike): ReglesDuReferentielMesuresV2 {
    const resultat: ReglesDuReferentielMesuresV2 = [];
    const contenuCSV = fs.readFileSync(cheminCSV).toString();

    Papa.parse(contenuCSV, {
      header: true,
      skipEmptyLines: true,
      transform: (value: string, field: string) => {
        if (field === 'REF' && !this.estMesureConnueDeMSS(value))
          throw new ErreurMoteurDeReglesV2(
            `La mesure '${value}' n'existe pas dans le référentiel MSS`
          );

        if (field === 'Statut initial') return this.traduisStatutInitial(value);

        if (field === 'Basique') return this.traduisBesoinDeSecurite(value);
        if (field === 'Modéré') return this.traduisBesoinDeSecurite(value);
        if (field === 'Avancé') return this.traduisBesoinDeSecurite(value);

        if (
          CHAMPS_CONCERNES_MODIFICATEURS.includes(field as ChampsModificateurs)
        )
          return this.traduisTousModificateurs(value);

        return value;
      },
      step: ({ data }: { data: LigneDeCSVTransformee }) => {
        const modificateurSiPresent = <T>(
          cle: ChampsModificateurs,
          valeur: T
        ) => {
          const modificateurs = data[cle] as Modificateur[];
          return modificateurs.length > 0
            ? [[valeur, modificateurs] as [T, Modificateur[]]]
            : [];
        };

        const criticiteDonneesTraitees = [
          ...modificateurSiPresent<NiveauCriticite>('Données : +', 1),
          ...modificateurSiPresent<NiveauCriticite>('Données : ++', 2),
          ...modificateurSiPresent<NiveauCriticite>('Données : +++', 3),
          ...modificateurSiPresent<NiveauCriticite>('Données : ++++', 4),
        ];
        const donneesHorsUE = [
          ...modificateurSiPresent('Données : Hors UE', true),
        ];
        const criticiteDisponibilite = [
          ...modificateurSiPresent<NiveauCriticite>('Dispo : +', 1),
          ...modificateurSiPresent<NiveauCriticite>('Dispo : ++', 2),
          ...modificateurSiPresent<NiveauCriticite>('Dispo : +++', 3),
          ...modificateurSiPresent<NiveauCriticite>('Dispo : ++++', 4),
        ];
        const criticiteOuverture = [
          ...modificateurSiPresent<NiveauCriticite>('Ouv : +', 1),
          ...modificateurSiPresent<NiveauCriticite>('Ouv : ++', 2),
          ...modificateurSiPresent<NiveauCriticite>('Ouv : +++', 3),
          ...modificateurSiPresent<NiveauCriticite>('Ouv : ++++', 4),
        ];
        const specificitesProjet = [
          ...modificateurSiPresent<SpecificiteProjet>(
            'Accès physique : Salles techniques',
            'accesPhysiqueAuxSallesTechniques'
          ),
          ...modificateurSiPresent<SpecificiteProjet>(
            'Accès physique : Bureaux',
            'accesPhysiqueAuxBureaux'
          ),
          ...modificateurSiPresent<SpecificiteProjet>('Annuaire', 'annuaire'),
          ...modificateurSiPresent<SpecificiteProjet>(
            'Signature électronique',
            'dispositifDeSignatureElectronique'
          ),
          ...modificateurSiPresent<SpecificiteProjet>(
            "Echange et/ou réception d'emails",
            'echangeOuReceptionEmails'
          ),
          ...modificateurSiPresent<SpecificiteProjet>(
            'Poste de travail ou téléphone',
            'postesDeTravail'
          ),
        ];
        const typeService = [
          ...modificateurSiPresent<TypeDeService>(
            'Application mobile',
            'applicationMobile'
          ),
          ...modificateurSiPresent<TypeDeService>('API', 'api'),
          ...modificateurSiPresent<TypeDeService>(
            "Portail d'information",
            'portailInformation'
          ),
          ...modificateurSiPresent<TypeDeService>(
            'Service en ligne',
            'serviceEnLigne'
          ),
          ...modificateurSiPresent<TypeDeService>(
            "Autre Système d'information",
            'autreSystemeInformation'
          ),
        ];
        const activitesExternalisees = [
          ...modificateurSiPresent<ActiviteExternalisee | 'LesDeux'>(
            'EXT : Admin tech',
            'administrationTechnique'
          ),
          ...modificateurSiPresent<ActiviteExternalisee | 'LesDeux'>(
            'EXT : Dév',
            'developpementLogiciel'
          ),
          ...modificateurSiPresent<ActiviteExternalisee | 'LesDeux'>(
            'EXT : MCO/MCS',
            'LesDeux'
          ),
        ];
        const typeHebergement = [
          ...modificateurSiPresent<TypeHebergement>(
            'EXT : On-premise',
            'onPremise'
          ),
          ...modificateurSiPresent<TypeHebergement>(
            'EXT : PaaS / IaaS',
            'cloud'
          ),
          ...modificateurSiPresent<TypeHebergement>('EXT : SaaS', 'saas'),
        ];
        const modificateurs: ModificateursDeRegles = {
          ...(criticiteDonneesTraitees.length > 0 && {
            criticiteDonneesTraitees,
          }),
          ...(donneesHorsUE.length > 0 && { donneesHorsUE }),
          ...(criticiteDisponibilite.length > 0 && { criticiteDisponibilite }),
          ...(criticiteOuverture.length > 0 && { criticiteOuverture }),
          ...(specificitesProjet.length > 0 && { specificitesProjet }),
          ...(typeService.length > 0 && { typeService }),
          ...(activitesExternalisees.length > 0 && { activitesExternalisees }),
          ...(typeHebergement.length > 0 && { typeHebergement }),
        };

        resultat.push({
          reference: data.REF,
          dansSocleInitial: data['Statut initial'],
          besoinsDeSecurite: {
            niveau1: data.Basique!,
            niveau2: data['Modéré']!,
            niveau3: data['Avancé']!,
          },
          modificateurs,
        });
      },
    });

    return resultat;
  }

  private estMesureConnueDeMSS(
    reference: string
  ): reference is keyof typeof mesuresV2 {
    return (
      this.referentielMesures[reference as keyof typeof mesuresV2] !== undefined
    );
  }

  // eslint-disable-next-line class-methods-use-this
  private traduisBesoinDeSecurite(valeurCSV: string): ModificateurPourBesoin {
    if (!valeurCSV) return 'Absente';
    if (valeurCSV === 'Indispensable') return 'Indispensable';
    if (valeurCSV === 'Recommandation') return 'Recommandée';

    throw new ErreurMoteurDeReglesV2(
      `Le modificateur '${valeurCSV}' est inconnu`
    );
  }

  // eslint-disable-next-line class-methods-use-this
  private traduisStatutInitial(valeurCSV: string) {
    if (!(valeurCSV in this.statutsInitiaux))
      throw new ErreurMoteurDeReglesV2(
        `Le statut initial '${valeurCSV}' est inconnu`
      );

    return this.statutsInitiaux[valeurCSV as keyof typeof this.statutsInitiaux];
  }

  // eslint-disable-next-line class-methods-use-this
  private traduisTousModificateurs(valeurCSV: string): Modificateur[] {
    if (!valeurCSV) return [];

    return valeurCSV.split(', ').map((v) => this.traduisModificateur(v));
  }

  // eslint-disable-next-line class-methods-use-this
  private traduisModificateur(valeurCSV: string): Modificateur {
    if (valeurCSV === 'Indispensable') return 'RendreIndispensable';
    if (valeurCSV === 'Recommandation') return 'RendreRecommandee';
    if (valeurCSV === 'Ajoutée') return 'Ajouter';
    if (valeurCSV === 'Retirée') return 'Retirer';
    if (valeurCSV === 'Projet') return 'Projet';
    if (valeurCSV === 'Presta') return 'Presta';
    if (valeurCSV === 'Mixte') return 'Mixte';

    throw new ErreurMoteurDeReglesV2(
      `Le modificateur '${valeurCSV}' est inconnu`
    );
  }
}
