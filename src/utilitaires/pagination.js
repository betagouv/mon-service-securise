const pagination = (nbRisquesParPage, items) => {
  let page = -1;
  return items.reduce(
    (acc, item, index) => {
      if (index % nbRisquesParPage === 0) page += 1;
      acc[page] ||= [];
      acc[page].push(item);
      return acc;
    },
    [[]]
  );
};

module.exports = { pagination };
