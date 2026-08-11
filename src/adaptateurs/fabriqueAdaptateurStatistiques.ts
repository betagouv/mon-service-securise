import { adaptateurStatistiquesMetabase } from './adaptateurStatistiquesMetabase.js';
import { adaptateurStatistiquesMemoire } from './adaptateurStatistiquesMemoire.js';

const fabriqueAdaptateurStatistiques = () =>
  process.env.METABASE_API_KEY && process.env.STATISTIQUES_DOMAINE_METABASE_MSS
    ? adaptateurStatistiquesMetabase
    : adaptateurStatistiquesMemoire;

export default fabriqueAdaptateurStatistiques;
