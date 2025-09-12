import * as fs from 'node:fs';
import Papa from 'papaparse';
import { PathLike } from 'fs';
import { mesuresV2 } from '../../../../donneesReferentielMesuresV2.js';
import { ErreurMoteurDeReglesV2 } from '../../../erreurs.js';
import {
  IdMesureV2,
  Modificateur,
  ModificateursDeRegles,
  ReglesDuReferentielMesuresV2,
} from '../moteurReglesV2.js';

type LigneDeCSVTransformee = {
  REF: IdMesureV2;
  'Statut initial': boolean;
  Basique?: Modificateur;
  Modéré?: Modificateur;
  Avancé?: Modificateur;
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

        if (field === 'Basique') return this.traduisModificateur(value);
        if (field === 'Modéré') return this.traduisModificateur(value);
        if (field === 'Avancé') return this.traduisModificateur(value);

        return value;
      },
      step: ({ data }: { data: LigneDeCSVTransformee }) => {
        const { REF } = data;

        const modificateurs: ModificateursDeRegles = {};

        if (data.Basique || data['Modéré'] || data['Avancé']) {
          modificateurs.niveauDeSecurite = [];
          if (data.Basique)
            modificateurs.niveauDeSecurite.push(['niveau1', data.Basique]);
          if (data['Modéré'])
            modificateurs.niveauDeSecurite.push(['niveau2', data['Modéré']]);
          if (data['Avancé'])
            modificateurs.niveauDeSecurite.push(['niveau3', data['Avancé']]);
        }

        resultat.push({
          reference: REF,
          dansSocleInitial: data['Statut initial'],
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
  private traduisModificateur(valeurCSV: string): Modificateur | null {
    if (!valeurCSV) return null;
    if (valeurCSV === 'Indispensable') return 'RendreIndispensable';
    if (valeurCSV === 'Recommandation') return 'RendreRecommandee';

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
}
