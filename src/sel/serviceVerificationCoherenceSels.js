/* eslint-disable no-console */
const fabriqueServiceVerificationCoherenceSels = ({
  adaptateurEnvironnement,
  depotDonnees,
}) => ({
  verifieLaCoherenceDesSels: async () => {
    try {
      const nouveauSel = await depotDonnees.verifieLaCoherenceDesSels();
      if (nouveauSel) {
        if (!adaptateurEnvironnement.modeMaintenance().actif()) {
          throw new Error(
            `Nouveau sel (version ${nouveauSel.version}) présent dans la configuration`
          );
        } else {
          console.log(
            `🏗️ Mode maintenance détécté, sel version ${nouveauSel.version} à migrer`
          );
        }
      } else {
        console.log('✅ Vérification des sels réussie');
      }
    } catch (e) {
      process.stdout.write(`Erreur de vérification des sels: ${e?.message}\n`);
      process.exit(1);
    }
  },
});
/* eslint-enable no-console */

module.exports = { fabriqueServiceVerificationCoherenceSels };
