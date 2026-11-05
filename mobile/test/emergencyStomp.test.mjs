import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';

function fixture() {
  const sockets = [];
  class Socket {
    static OPEN = 1;
    readyState = 1;
    frames = [];
    constructor() { sockets.push(this); }
    send(frame) { this.frames.push(frame); }
    close() { this.readyState = 3; }
  }
  const source = readFileSync(new URL('../src/modules/chat/infrastructure/EmergencyStompClient.ts', import.meta.url), 'utf8')
    .replace("import appConfig from '@core/config/appConfig';", "const appConfig = { wsUrl: 'ws://localhost/ws' };");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  runInNewContext(compiled, { exports, WebSocket: Socket, setTimeout, clearTimeout });
  const messages = [];
  const client = new exports.EmergencyStompClient({ emergencyId: 'alert', accessToken: () => 'test-token', onConnection() {}, onMessage: (value) => messages.push(value), onEmergencyStatus() {}, onAuthorizationFailure() {} });
  return { client, sockets, messages };
}

test('rejects unavailable transport and reports success only after writing SEND', () => {
  const { client, sockets } = fixture();
  assert.throws(() => client.send('logical-id', 'Ayuda'), /no está conectado/);
  client.start(); const socket = sockets[0]; socket.onopen();
  assert.throws(() => client.send('logical-id', 'Ayuda'), /no está conectado/);
  socket.onmessage({ data: 'CONNECTED\n\n\0' });
  assert.equal(client.send('logical-id', 'Ayuda'), true);
  assert.match(socket.frames.at(-1), /SEND/);
  assert.match(socket.frames.at(-1), /logical-id/);
  socket.readyState = 3;
  assert.throws(() => client.send('logical-id', 'Ayuda'), /no está conectado/);
  client.stop();
});

test('a transport exception is never treated as sent', () => {
  const { client, sockets } = fixture(); client.start();
  sockets[0].onmessage({ data: 'CONNECTED\n\n\0' });
  sockets[0].send = () => { throw new Error('transport failure'); };
  assert.throws(() => client.send('retry-same-id', 'Ayuda'), /transport failure/);
  client.stop();
});
