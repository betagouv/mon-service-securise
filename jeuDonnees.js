module.exports = {
  utilisateurs: [
    {
      id: '456',
      prenom: 'Jean',
      nom: 'Dupont',
      email: 'jean.dupont@mail.fr',
      motDePasse: '$2b$10$drxIuIeBOfVzpdwZydd1/u5UUo8x7U2.8GOuoVvbGXY57SYtXOPNy', // 'mdp_12345'
      cguAcceptees: true,
    },
    {
      id: '999',
      prenom: 'Sylvie',
      nom: 'Martin',
      email: 'sylvie.martin@mail.fr',
      motDePasse: '$2b$10$y6iFwRYVjmiuHeFBn73aDupGvKYlV3wW/tgEZsJn7Zp/uzdVa6E4K', // 'mdp_12345'
    },
  ],

  homologations: [
    {
      id: '123',
      idUtilisateur: '456',
      informationsGenerales: { nomService: 'Super Service', typeService: ['api'] },
      mesures: [
        // gouvernance
        { id: 'limitationInterconnexions', statut: 'fait' },
        { id: 'listeEquipements', statut: 'fait' },
        { id: 'identificationDonneesSensibles', statut: 'planifie' },
        { id: 'contactSecurite', statut: 'nonRetenu' },

        // protection
        { id: 'deconnexionAutomatique', statut: 'fait' },
        { id: 'accesSecurise', statut: 'fait' },

        // defense
        { id: 'gestionIncidents', statut: 'fait' },
        { id: 'journalAcces', statut: 'planifie' },

        // resilience
        { id: 'exerciceGestionCrise', statut: 'planifie' },
        { id: 'politiqueInformation', statut: 'planifie' },
      ],
    },
    {
      id: '789',
      idUtilisateur: '999',
      informationsGenerales: { nomService: 'Un autre service', typeService: ['siteInternet'] },
    },
  ],
};
