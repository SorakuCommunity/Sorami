import dns from 'node:dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const origLookup = dns.lookup;

(dns as any).lookup = (hostname: string, options: any, callback?: any) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  if (typeof options === 'number') {
    options = { family: options };
  }
  if (!callback) {
    callback = () => {};
  }

  const family = options?.family ?? 0;
  const all = options?.all ?? false;

  const resolver = family === 6 ? dns.resolve6 : dns.resolve4;

  resolver(hostname, (err: any, addresses: any) => {
    if (err || !addresses || addresses.length === 0) {
      origLookup(hostname, options, callback);
      return;
    }

    if (all) {
      callback(null, addresses.map((addr: string) => ({
        address: addr,
        family: family || (resolver === dns.resolve6 ? 6 : 4),
      })));
    } else {
      callback(null, addresses[0], family || (resolver === dns.resolve6 ? 6 : 4));
    }
  });
};
