export const fabriqueAdaptateurHorloge = () => ({
  maintenant: () => new Date(),
});

export type AdaptateurHorloge = ReturnType<typeof fabriqueAdaptateurHorloge>;
