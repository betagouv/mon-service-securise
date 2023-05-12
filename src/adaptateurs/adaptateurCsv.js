const { EOL } = require('os');
const { decode } = require('html-entities');
const { fabriqueAdaptateurGestionErreur } = require('./fabriqueAdaptateurGestionErreur');

const SEPARATEUR = ';';

const remplaceSeparateurParEspace = (chaine) => chaine.replaceAll(SEPARATEUR, ' ');
const remplaceBooleen = (booleen) => (booleen ? 'Oui' : 'Non');

const ligneDuService = (service) => (
  [
    remplaceSeparateurParEspace(decode(service.nomService)),
    service.organisationsResponsables.map((o) => decode(o)).map(remplaceSeparateurParEspace).join(' - '),
    service.nombreContributeurs,
    remplaceBooleen(service.estCreateur),
    service.indiceCyber,
    service.statutHomologation.libelle,
  ].join(SEPARATEUR)
);

const genereCsvServices = (donneesObjetGetServices) => {
  try {
    const entete = [
      'Nom du service',
      'Organisations responsables',
      'Nombre de collaborateurs',
      'Est propriétaire ?',
      'Indice cyber',
      'Statut homologation',
    ].join(SEPARATEUR);

    const contenu = [entete, ...donneesObjetGetServices.services.map(ligneDuService)].join(EOL);

    const avecBOM = '\uFEFF';
    return Buffer.from(`${avecBOM}${contenu}`, 'utf-8');
  } catch (e) {
    fabriqueAdaptateurGestionErreur().logueErreur(e);
    throw e;
  }
};

module.exports = { genereCsvServices };
