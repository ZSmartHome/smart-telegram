import {parse} from "url";
import Agent from "socks5-https-client/lib/Agent";

export default (url?: string): object | undefined => {
  if (!url) return undefined;

  url = url.toLowerCase();
  const parsed = parse(url, true);

  switch (parsed.protocol) {
    case `http:`:
    case `https:`:
      return {proxy: url};
    case `tg:`:
      if (parsed.host === `socks`) {
        const proxy = parsed.query;
        return {
          strictSSL: true,
          agentClass: Agent,
          agentOptions: {
            socksHost: proxy.server,
            socksPort: parseInt(proxy.port),
            // If authorization is needed:
            socksUsername: proxy.user,
            socksPassword: proxy.pass
          }
        }
      }
  }

  return undefined;
}