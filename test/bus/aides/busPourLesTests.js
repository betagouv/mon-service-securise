const fabriqueBusPourLesTests = () => {
  const evenementsRecus = [];
  return {
    publie: async (e) => evenementsRecus.push(e),
    aRecuUnEvenement: (typeAttendu) => {
      if (evenementsRecus.find((e) => e instanceof typeAttendu)) return true;

      throw new Error(
        `Événement attendu non reçu. Reçu : ${evenementsRecus
          .map((e) => e.constructor.name)
          .join(' ')}`
      );
    },
    nAPasRecuUnEvenement: (typeNonAttendu) => {
      if (!evenementsRecus.some((e) => e instanceof typeNonAttendu))
        return true;

      throw new Error(
        `Événement non attendu reçu. Reçu : ${evenementsRecus
          .map((e) => e.constructor.name)
          .join(' ')}`
      );
    },
    recupereEvenement: (typeAttendu) =>
      evenementsRecus.find((e) => e instanceof typeAttendu),
    recupereEvenements: (typeAttendu) =>
      evenementsRecus.filter((e) => e instanceof typeAttendu),
  };
};

export { fabriqueBusPourLesTests };
