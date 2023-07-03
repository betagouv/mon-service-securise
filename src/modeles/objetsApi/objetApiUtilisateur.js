const enUtilisateurApi = (utilisateur) => ({
  id: utilisateur.id,
  cguAcceptees: utilisateur.accepteCGU(),
  initiales: utilisateur.initiales(),
  prenom: utilisateur.prenom,
  nom: utilisateur.nom,
  prenomNom: utilisateur.prenomNom(),
  telephone: utilisateur.telephone || '',
  poste: utilisateur.poste || '',
  posteDetaille: utilisateur.posteDetaille(),
  rssi: utilisateur.estRSSI(),
  delegueProtectionDonnees: utilisateur.estDelegueProtectionDonnees(),
  nomEntitePublique: utilisateur.nomEntitePublique || '',
  departementEntitePublique: utilisateur.departementEntitePublique || '',
  profilEstComplet: utilisateur.profilEstComplet(),
  infolettreAcceptee: utilisateur.accepteInfolettre(),
});

module.exports = { enUtilisateurApi };
