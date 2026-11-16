import Service from '../service.js';
import { IdMesureV1 } from '../../../donneesConversionReferentielMesures.js';
import { IdMesureV2 } from '../../../donneesReferentielMesuresV2.js';
import { IdCategorieMesure } from '../../referentiel.types.js';
import { PartieResponsable } from '../../moteurRegles/v2/modifications.js';

type IdMesure = IdMesureV1 & IdMesureV2;

const STATUTS_RESTANTS = ['enCours', 'aLancer'] as const;
type StatutRestant = (typeof STATUTS_RESTANTS)[number];

export type ExigenceRestante = {
  description: string;
  statut: StatutRestant;
  cartouches: string[];
  echeance?: string;
  porteurs?: string;
};

const PORTEURS: Record<PartieResponsable, string> = {
  Projet: 'Équipe projet',
  Presta: 'Prestataire',
  Mixte: 'Équipe projet et prestataire',
};

const enJourMoisAnnee = new Intl.DateTimeFormat('fr', {
  timeZone: 'Europe/Paris',
}).format;

const echeanceDe = (echeance?: Date) => echeance && enJourMoisAnnee(echeance);

type MesurePersonnalisee = { partieResponsable?: PartieResponsable };

const porteursDe = (mesurePersonnalisee?: MesurePersonnalisee) =>
  mesurePersonnalisee?.partieResponsable &&
  PORTEURS[mesurePersonnalisee.partieResponsable];

const estRestant = (statut?: string): statut is StatutRestant =>
  STATUTS_RESTANTS.includes(statut as StatutRestant);

const cartouchesDUneMesureGenerale = (
  { referentiel }: Service,
  mesure: {
    estIndispensable(): boolean;
    donneesReferentiel(): {
      categorie: string;
      identifiantNumerique?: string;
      referentiel?: string;
    };
  }
) => {
  const {
    categorie,
    identifiantNumerique,
    referentiel: source,
  } = mesure.donneesReferentiel();
  return [
    mesure.estIndispensable() ? 'Indispensable' : 'Recommandée',
    source,
    referentiel.descriptionCategorie(categorie as IdCategorieMesure),
    identifiantNumerique && `#${identifiantNumerique}`,
  ].filter((cartouche): cartouche is string => !!cartouche);
};

const mesuresGeneralesRestantes = (service: Service): ExigenceRestante[] => {
  const { referentiel, mesures } = service;
  const mesuresPersonnalisees = mesures.mesuresPersonnalisees as Record<
    string,
    MesurePersonnalisee
  >;
  const idsApplicables = Object.keys(mesuresPersonnalisees);
  return (Object.keys(referentiel.mesures()) as IdMesure[])
    .filter((id) => idsApplicables.includes(id))
    .flatMap((id) => {
      const mesure = mesures.mesuresGenerales.avecId(id);
      if (!mesure || !estRestant(mesure.statut)) return [];
      return [
        {
          description: mesure.descriptionMesure(),
          statut: mesure.statut,
          cartouches: cartouchesDUneMesureGenerale(service, mesure),
          echeance: echeanceDe(mesure.echeance),
          porteurs: porteursDe(mesuresPersonnalisees[id]),
        },
      ];
    });
};

const mesuresSpecifiquesRestantes = ({
  referentiel,
  mesures,
}: Service): ExigenceRestante[] =>
  mesures.mesuresSpecifiques
    .toutes()
    .flatMap(({ description, statut, categorie, echeance }) =>
      estRestant(statut)
        ? [
            {
              description,
              statut,
              cartouches: [
                'Spécifique',
                referentiel.descriptionCategorie(
                  categorie as IdCategorieMesure
                ),
                'Ajoutée',
              ],
              echeance: echeanceDe(echeance),
            },
          ]
        : []
    );

export const exigencesRestantes = (service: Service): ExigenceRestante[] => [
  ...mesuresGeneralesRestantes(service),
  ...mesuresSpecifiquesRestantes(service),
];
