module.exports = {
  utilisateurs: [
    {
      id: '456',
      prenom: 'Jean',
      nom: 'Dupont',
      email: 'jean.dupont@mail.fr',
      motDePasse: '$2b$10$drxIuIeBOfVzpdwZydd1/u5UUo8x7U2.8GOuoVvbGXY57SYtXOPNy', // 'mdp_12345'
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
    { id: '123', idUtilisateur: '456', nomService: 'Super Service', natureService: ['api'] },
    { id: '789', idUtilisateur: '999', nomService: 'Un autre service', natureService: ['siteInternet'] },
  ],
};
