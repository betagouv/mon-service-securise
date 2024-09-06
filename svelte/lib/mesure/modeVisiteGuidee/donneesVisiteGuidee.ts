import type { ActiviteMesure } from '../mesure.d';

export const activitesVisiteGuidee: ActiviteMesure[] = [
  {
    date: new Date(2024, 8, 17, 14, 18),
    type: 'ajoutEcheance',
    idActeur: 'U2',
    identifiantNumeriqueMesure: '0043',
    details: { nouvelleValeur: new Date('2025-04-24') },
  },
  {
    date: new Date(2024, 8, 16, 17, 35),
    type: 'miseAJourStatut',
    idActeur: 'U1',
    identifiantNumeriqueMesure: '0043',
    details: { ancienneValeur: 'aLancer', nouvelleValeur: 'fait' },
  },
  {
    date: new Date(2024, 8, 15, 13, 15),
    type: 'ajoutResponsable',
    idActeur: 'U2',
    identifiantNumeriqueMesure: '0043',
    details: { valeur: 'U1' },
  },
  {
    date: new Date(2024, 8, 15, 8, 13),
    type: 'ajoutStatut',
    idActeur: 'U1',
    identifiantNumeriqueMesure: '0043',
    details: { nouvelleValeur: 'aLancer' },
  },
];
