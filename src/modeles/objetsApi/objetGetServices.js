const donnees = (services) => ({ services: services.map((s) => s.toJSON()) });

module.exports = { donnees };
