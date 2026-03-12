/**
 * Twilio REST API client using fetch (no SDK).
 */

const TWILIO_API = 'https://api.twilio.com/2010-04-01';

function getAuth(): string {
  const sid = process.env.TWILIO_ACCOUNT_SID || '';
  const token = process.env.TWILIO_AUTH_TOKEN || '';
  return 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64');
}

function getAccountSid(): string {
  return process.env.TWILIO_ACCOUNT_SID || '';
}

async function twilioFetch(endpoint: string, options: RequestInit = {}): Promise<Record<string, unknown>> {
  const res = await fetch(`${TWILIO_API}/Accounts/${getAccountSid()}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': getAuth(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twilio ${res.status}: ${text}`);
  }

  return res.json();
}

export async function searchAvailableNumbers(
  areaCode: string,
  country: string = 'US',
  limit: number = 10
): Promise<{ phone_number: string; friendly_name: string; locality: string; region: string }[]> {
  const params = new URLSearchParams({
    AreaCode: areaCode,
    VoiceEnabled: 'true',
    SmsEnabled: 'true',
    PageSize: String(limit),
  });

  const data = await twilioFetch(
    `/AvailablePhoneNumbers/${country}/Local.json?${params}`
  );

  const numbers = (data.available_phone_numbers || []) as {
    phone_number: string;
    friendly_name: string;
    locality: string;
    region: string;
  }[];

  return numbers.map((n) => ({
    phone_number: n.phone_number,
    friendly_name: n.friendly_name,
    locality: n.locality,
    region: n.region,
  }));
}

export async function purchaseNumber(phoneNumber: string): Promise<{ sid: string; phone_number: string; friendly_name: string }> {
  const data = await twilioFetch('/IncomingPhoneNumbers.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ PhoneNumber: phoneNumber }).toString(),
  });

  return {
    sid: data.sid as string,
    phone_number: data.phone_number as string,
    friendly_name: data.friendly_name as string,
  };
}

export async function configureWebhook(
  sid: string,
  voiceUrl: string,
  statusUrl: string
): Promise<void> {
  await twilioFetch(`/IncomingPhoneNumbers/${sid}.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      VoiceUrl: voiceUrl,
      VoiceMethod: 'POST',
      StatusCallback: statusUrl,
      StatusCallbackMethod: 'POST',
    }).toString(),
  });
}

export async function releaseNumber(sid: string): Promise<void> {
  const accountSid = getAccountSid();
  await fetch(`${TWILIO_API}/Accounts/${accountSid}/IncomingPhoneNumbers/${sid}.json`, {
    method: 'DELETE',
    headers: { 'Authorization': getAuth() },
  });
}
