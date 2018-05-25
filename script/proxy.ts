import {parse} from "url";
import {HttpsAgent, auth} from "socksv5";

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
          agentClass: HttpsAgent,
          agentOptions: {
            proxyHost: proxy.server,
            proxyPort: parseInt(proxy.port),
            auths: [ auth.UserPassword(proxy.user, proxy.pass) ]
          }
        }
      }
  }

  return undefined;
}