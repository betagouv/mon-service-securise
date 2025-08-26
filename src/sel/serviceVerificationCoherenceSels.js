/* eslint-disable no-console */
const fabriqueServiceVerificationCoherenceSels = ({
  adaptateurEnvironnement,
  depotDonnees,
}) => ({
  verifieLaCoherenceDesSels: async () => {
    if (adaptateurEnvironnement.modeMaintenance().actif()) {
      console.log('🏗 Pas de vérification des sels en mode maintenance');
      return;
    }

    try {
      await depotDonnees.verifieLaCoherenceDesSels();
      console.log('✅ Vérification des sels réussie');
    } catch (e) {
      process.stdout.write(
        `💥 Erreur de vérification des sels: ${e?.message}\n`
      );
      process.exit(1);
    }
  },
});

/* eslint-enable no-console */

export default { fabriqueServiceVerificationCoherenceSels };
