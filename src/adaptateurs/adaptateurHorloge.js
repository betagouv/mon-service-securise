const fabriqueAdaptateurHorloge = () => ({
  maintenant: () => new Date(),
});

module.exports = { fabriqueAdaptateurHorloge };
