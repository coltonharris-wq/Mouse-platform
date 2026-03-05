#!/usr/bin/env node
/**
 * chat-bridge.mjs — Web Chat Bridge for King Mouse VMs
 * 
 * Connects to the local OpenClaw gateway via WebSocket, sends a message
 * through the full agent pipeline (SOUL.md, memory, tools), and returns
 * the response.
 * 
 * Usage: node chat-bridge.mjs "your message here" [sessionKey]
 * Output: JSON on stdout: {"reply": "...", "error": null}
 * 
 * Requires Node 22+ (native WebSocket support).
 * Gateway must be running on ws://127.0.0.1:18789 with auth.mode: "open"
 */

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'ws://127.0.0.1:18789';
const TIMEOUT_MS = parseInt(process.env.CHAT_TIMEOUT_MS || '120000', 10); // 2 min default

const message = process.argv[2];
const sessionKey = process.argv[3] || 'main';

if (!message) {
  console.log(JSON.stringify({ reply: null, error: 'No message provided' }));
  process.exit(1);
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

async function chat(msg, sessKey) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(GATEWAY_URL);
    let connected = false;
    let chatRunId = null;
    let responseText = '';
    let connectNonce = null;

    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('Timeout waiting for response'));
    }, TIMEOUT_MS);

    const cleanup = () => {
      clearTimeout(timeout);
      try { ws.close(); } catch {}
    };

    ws.addEventListener('open', () => {
      // Wait for connect.challenge event before sending connect
    });

    ws.addEventListener('error', (err) => {
      cleanup();
      reject(new Error(`WebSocket error: ${err.message || 'connection failed'}`));
    });

    ws.addEventListener('close', (evt) => {
      cleanup();
      if (!connected) {
        reject(new Error(`Gateway closed before connect (${evt.code}): ${evt.reason || 'no reason'}`));
      }
      // If we already resolved, this is fine
    });

    ws.addEventListener('message', (evt) => {
      let data;
      try {
        data = JSON.parse(String(evt.data));
      } catch { return; }

      // Handle events
      if (data.type === 'event') {
        // connect.challenge — respond with connect request
        if (data.event === 'connect.challenge') {
          connectNonce = data.payload?.nonce || '';
          const connectId = uuid();
          ws.send(JSON.stringify({
            type: 'req',
            id: connectId,
            method: 'connect',
            params: {
              minProtocol: 3,
              maxProtocol: 3,
              client: {
                id: 'webchat-bridge',
                version: '1.0.0',
                platform: 'linux',
                mode: 'webchat',
                instanceId: uuid(),
              },
              role: 'operator',
              scopes: ['operator.write'],
              caps: [],
              nonce: connectNonce,
            },
          }));
          return;
        }

        // chat event — collect response
        if (data.event === 'chat') {
          const payload = data.payload;
          if (!payload) return;

          // Track our run
          if (chatRunId && payload.runId !== chatRunId) return;

          if (payload.state === 'delta') {
            // Streaming update — grab latest text
            const text = extractText(payload.message);
            if (text) responseText = text;
          } else if (payload.state === 'final') {
            // Done — extract final text
            const text = extractText(payload.message);
            if (text) responseText = text;
            cleanup();
            resolve(responseText || '(no response)');
          } else if (payload.state === 'error') {
            cleanup();
            reject(new Error(payload.errorMessage || 'Agent error'));
          } else if (payload.state === 'aborted') {
            cleanup();
            resolve(responseText || '(aborted)');
          }
        }
        return;
      }

      // Handle RPC responses
      if (data.type === 'res') {
        // Check if this is the connect response
        if (data.ok && !connected) {
          connected = true;
          // Now send the chat message
          const sendId = uuid();
          chatRunId = uuid();
          ws.send(JSON.stringify({
            type: 'req',
            id: sendId,
            method: 'chat.send',
            params: {
              sessionKey: sessKey,
              message: msg,
              deliver: false, // Don't deliver to channels, just return here
              idempotencyKey: chatRunId,
            },
          }));
          return;
        }

        // chat.send response — just ack, real response comes via chat events
        if (data.ok) return;

        // Error response
        if (!data.ok && data.error) {
          cleanup();
          reject(new Error(data.error.message || 'Gateway request failed'));
        }
      }
    });
  });
}

function extractText(message) {
  if (!message) return null;
  if (typeof message.text === 'string') return message.text;
  if (typeof message.content === 'string') return message.content;
  if (Array.isArray(message.content)) {
    const texts = message.content
      .filter(c => c.type === 'text' && typeof c.text === 'string')
      .map(c => c.text);
    return texts.length > 0 ? texts.join('\n') : null;
  }
  return null;
}

try {
  const reply = await chat(message, sessionKey);
  console.log(JSON.stringify({ reply, error: null }));
} catch (err) {
  console.log(JSON.stringify({ reply: null, error: err.message }));
  process.exit(1);
}
