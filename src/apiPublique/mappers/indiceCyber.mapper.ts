import { DonneesIndiceCyber } from '../../modeles/indiceCyber.type.js';
import { IndiceCyberApiPublique } from '../schemas/indiceCyber.schema.js';

const arrondiAUneDecimale = (note: number) => Number(note.toFixed(1));

export const serialiseIndiceCyberPourAPIPublique = (
  indiceCyber: DonneesIndiceCyber,
  noteMax: number
): IndiceCyberApiPublique => ({
  noteMax,
  total: arrondiAUneDecimale(indiceCyber.total),
  parCategorie: {
    gouvernance: arrondiAUneDecimale(indiceCyber.gouvernance),
    protection: arrondiAUneDecimale(indiceCyber.protection),
    defense: arrondiAUneDecimale(indiceCyber.defense),
    resilience: arrondiAUneDecimale(indiceCyber.resilience),
  },
});
