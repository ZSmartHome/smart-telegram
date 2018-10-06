import * as assert from 'assert';
import {suite, test} from 'mocha-typescript';
import {parse} from 'url';
import proxy from '../script/proxy';

@suite('Configure proxy')
class SplitUtil {
  @test public 'http proxy should configure noremal'() {
    const url = `http://localhost:1345`;
    assert.deepEqual(proxy(url), {proxy: url});
  }

  @test public 'https proxy should configure noremal'() {
    const url = `https://localhost:1345`;
    assert.deepEqual(proxy(url), {proxy: url});
  }

  /*@test "tg protocol should be parsed as socks proxy"() {
    const url = `tg://socks?server=12%2E12%2E0%2E12&port=1212&user=rkn&pass=rkn`;
    const result = proxy(url);
    assert.ok(result !== undefined);
    assert.deepEqual((result as any).agentOptions, {
      socksHost: '12.12.0.12',
      socksPort: 1212,
      socksUsername: 'rkn',
      socksPassword: 'rkn'
    });
  }
*/
  @test public 'invalid proxy passed'() {
    const url = `jkshdjkasd;klasj;d`;
    assert.ok(proxy(url) === undefined);
  }

  @test public 'empty proxy passed'() {
    assert.ok(proxy(``) === undefined);
  }

  @test public 'no proxy passed'() {
    assert.ok(proxy() === undefined);
  }

  @test public 'tg protocol correct parse'() {
    const parsed = parse(`tg://socks?server=12%2E12%2E0%2E12&port=1212&user=rkn&pass=rkn`, true);
    assert.equal(parsed.protocol, `tg:`);
    assert.equal(parsed.host, `socks`);
    assert.deepEqual(parsed.query, {
      server: '12.12.0.12',
      port: '1212',
      user: 'rkn',
      pass: 'rkn',
    });
  }

}
