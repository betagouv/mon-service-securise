function extraisIp(headersExpress) {
  const ips = headersExpress['x-forwarded-for']?.split(', ');

  if (!ips) return {};

  return { client: ips[0], waf: ips[ips.length - 1] };
}

module.exports = { extraisIp };
