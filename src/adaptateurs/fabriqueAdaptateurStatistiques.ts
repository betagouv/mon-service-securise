import * as adaptateurStatistiques from './adaptateurStatistiquesMetabase.js';
import { adaptateurStatistiquesMemoire } from './adaptateurStatistiquesMemoire.js';

const fabriqueAdaptateurStatistiques = () =>
  process.env.METABASE_API_KEY && process.env.STATISTIQUES_DOMAINE_METABASE_MSS
    ? adaptateurStatistiques
    : adaptateurStatistiquesMemoire;

export default fabriqueAdaptateurStatistiques;
