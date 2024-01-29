const fabriqueBusPourLesTests = () => {
  const evenementsRecus = [];
  return {
    publie: async (e) => evenementsRecus.push(e),
    aRecuUnEvenement: (attendu) => {
      if (evenementsRecus.find((e) => e instanceof attendu)) return true;

      throw new Error(
        `Événement attendu non reçu. Reçu : ${evenementsRecus
          .map((e) => e.constructor.name)
          .join(' ')}`
      );
    },
  };
};

module.exports = { fabriqueBusPourLesTests };
