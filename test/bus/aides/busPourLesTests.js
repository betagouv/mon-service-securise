const fabriqueBusPourLesTests = () => {
  const busEvenements = {
    dernierEvenementRecu: null,
    publie: (e) => {
      busEvenements.dernierEvenementRecu = e;
    },
  };

  return busEvenements;
};

module.exports = { fabriqueBusPourLesTests };
