import { singulierPluriel } from '../../outils/string';

export const messageDepassement = (
  nombreModelesTeleverses: number,
  nombreMaximum: number,
  nombreRestant: number
) => `Votre fichier qui contient
          ${singulierPluriel(
            '1 ligne',
            `${nombreModelesTeleverses} lignes`,
            nombreModelesTeleverses
          )}
           vous ferait dépasser la limite des ${nombreMaximum} mesures. Vous pouvez en ajouter ${nombreRestant} au maximum.`;
