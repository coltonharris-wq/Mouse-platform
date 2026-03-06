#!/usr/bin/env node
// chat-bridge.mjs — WebSocket relay for dashboard → King Mouse VM communication
// Handles OpenClaw gateway protocol including Ed25519 device identity

import { createHash, generateKeyPairSync, sign } from 'node:crypto';

const GATEWAY_URL = process.env.GATEWAY_URL || 'ws://127.0.0.1:18789';
const TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS || '120000', 10);
const message = process.argv[2];

if (!message) {
  console.log(JSON.stringify({ reply: null, error: 'No message provided' }));
  process.exit(1);
}

// --- Ed25519 Device Identity ---

function base64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

function generateDeviceIdentity() {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'der' },
    privateKeyEncoding: { type: 'pkcs8', format: 'der' },
  });
  // Ed25519 raw public key is last 32 bytes of SPKI DER
  const rawPub = publicKey.slice(-32);
  const rawPriv = privateKey.slice(-32);
  const deviceId = createHash('sha256').update(rawPub).digest('hex');
  return {
    deviceId,
    publicKey: base64url(rawPub),
    privateKeyDer: privateKey, // full DER for signing
    rawPrivateKey: base64url(rawPriv),
  };
}

function signPayload(privateKeyDer, payload) {
  const privateKeyObj = {
    key: Buffer.from(privateKeyDer),
    format: 'der',
    type: 'pkcs8',
  };
  const sig = sign(null, Buffer.from(payload, 'utf8'), privateKeyObj);
  return base64url(sig);
}

function buildConnectPayload(opts) {
  const scopes = (opts.scopes || []).join(',');
  return [
    'v2',
    opts.deviceId,
    opts.clientId,
    opts.clientMode,
    opts.role,
    scopes,
    String(opts.signedAtMs),
    opts.token || '',
    opts.nonce || '',
  ].join('|');
}

// --- Main ---

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const device = generateDeviceIdentity();

let ws;
let connectNonce = null;
let connectSent = false;
let replyText = '';
let done = false;

const timer = setTimeout(() => {
  if (!done) {
    done = true;
    console.log(JSON.stringify({ reply: null, error: 'Timeout waiting for response' }));
    process.exit(1);
  }
}, TIMEOUT_MS);

function sendConnect() {
  if (connectSent) return;
  connectSent = true;

  const signedAt = Date.now();
  const scopes = ['operator.admin', 'operator.write', 'operator.approvals'];
  const payload = buildConnectPayload({
    deviceId: device.deviceId,
    clientId: 'webchat',
    clientMode: 'webchat',
    role: 'operator',
    scopes,
    signedAtMs: signedAt,
    token: '',
    nonce: connectNonce || '',
  });
  const signature = signPayload(device.privateKeyDer, payload);

  const connectParams = {
    minProtocol: 3,
    maxProtocol: 3,
    client: {
      id: 'webchat',
      version: 'chat-bridge-1.0',
      platform: 'linux',
      mode: 'webchat',
      instanceId: uuid(),
    },
    role: 'operator',
    scopes,
    device: {
      id: device.deviceId,
      publicKey: device.publicKey,
      signature,
      signedAt: signedAt,
      nonce: connectNonce || '',
    },
    caps: [],
    auth: {},
    userAgent: 'chat-bridge/1.0',
    locale: 'en',
  };

  ws.send(JSON.stringify({
    type: 'req',
    id: uuid(),
    method: 'connect',
    params: connectParams,
  }));
}

function sendMessage() {
  const reqId = uuid();
  ws.send(JSON.stringify({
    type: 'req',
    id: reqId,
    method: 'chat.send',
    params: {
      message,
      sessionKey: 'main',
      deliver: false,
      idempotencyKey: uuid(),
    },
  }));
}

try {
  ws = new WebSocket(GATEWAY_URL, {
    headers: { Origin: 'http://127.0.0.1:18789' },
  });
} catch (err) {
  console.log(JSON.stringify({ reply: null, error: `WebSocket connect failed: ${err.message}` }));
  process.exit(1);
}

ws.addEventListener('open', () => {
  // Wait for connect.challenge before sending connect
});

ws.addEventListener('message', (evt) => {
  let msg;
  try {
    msg = JSON.parse(String(evt.data));
  } catch {
    return;
  }

  // Handle connect.challenge
  if (msg.type === 'event' && msg.event === 'connect.challenge') {
    connectNonce = msg.payload?.nonce || '';
    sendConnect();
    return;
  }

  // Handle connect response (hello)
  if (msg.type === 'res' && msg.ok) {
    // If this is the connect response (has snapshot), send our chat message
    if (msg.payload?.snapshot || msg.payload?.protocol) {
      sendMessage();
      return;
    }
  }

  // Handle connect error
  if (msg.type === 'res' && !msg.ok) {
    if (!done) {
      done = true;
      clearTimeout(timer);
      const errMsg = msg.error?.message || 'Unknown gateway error';
      console.log(JSON.stringify({ reply: null, error: errMsg }));
      ws.close();
    }
    return;
  }

  // Handle chat events
  if (msg.type === 'event' && msg.event === 'chat') {
    const p = msg.payload;
    if (!p) return;

    if (p.state === 'delta') {
      // Extract text from delta
      const content = p.message?.content;
      if (Array.isArray(content)) {
        for (const block of content) {
          if (block.type === 'text' && typeof block.text === 'string') {
            replyText = block.text;
          }
        }
      } else if (typeof p.message?.text === 'string') {
        replyText = p.message.text;
      }
    }

    if (p.state === 'final' || p.state === 'aborted' || p.state === 'error') {
      if (!done) {
        done = true;
        clearTimeout(timer);

        if (p.state === 'error') {
          console.log(JSON.stringify({ reply: null, error: p.errorMessage || 'Chat error' }));
        } else {
          // Extract final text
          const content = p.message?.content;
          if (Array.isArray(content)) {
            for (const block of content) {
              if (block.type === 'text' && typeof block.text === 'string') {
                replyText = block.text;
              }
            }
          } else if (typeof p.message?.text === 'string') {
            replyText = p.message.text;
          }
          console.log(JSON.stringify({ reply: replyText || null, error: null }));
        }
        ws.close();
      }
    }
  }
});

ws.addEventListener('error', () => {
  if (!done) {
    done = true;
    clearTimeout(timer);
    console.log(JSON.stringify({ reply: null, error: 'WebSocket error' }));
    process.exit(1);
  }
});

ws.addEventListener('close', () => {
  if (!done) {
    done = true;
    clearTimeout(timer);
    console.log(JSON.stringify({ reply: replyText || null, error: replyText ? null : 'Connection closed before reply' }));
    process.exit(0);
  }
});
