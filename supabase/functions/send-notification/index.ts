import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SERVICE_ACCOUNT = {
  project_id: 'futamart-1',
  private_key_id: 'abe8f0712e4cac5f7211a5111e2420fc025a4dcb',
  private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC/l+9Y3zE73IfG\nV6pSiz7UXyd0YppiQGa0TNOENWJxDbDQzHrKHk+vw4wk8q1W5IycSmIDLQC2sQdY\nhmj549nMZ92Z6m6RnbC6m0vz9zFvIcvAQ75ovzcKvykVIIcjO0YhBsPqNtPFpKlM\nR7BUIxC17sDUDT9PRs13ejHj/qvvnvbd/8jvCtB/pK0KLQVI8VLyQLzfDhfOuWzE\n1dKLo++cHnE2WGDvTP/nK63UaU2jkYpVHVphTY0k6GQYRP84sKxua82yJpFC8NQe\n60zY3WuH2O9/HxDF9PGxEXGbsvDB7NKYHBzwRSdQomS84BLI11GPhfR/FNMYz8He\nSyFzlm19AgMBAAECggEAHEI6XvsSfbAOBaLmAAVCN9wuC1REzZOOom7HbtNZ6O9a\nQj26qaeVXMkEmWmCyBNvKtkswien2IpdWUD/6EWjWOsD7CD//HHMAIYJyprN24Sa\nUwoa4kO7yFXAJznUPM3QDux6xoeeLiNWhiX3u70tSIxFvDEVAqoggYwQIj7smKux\nqTsvvE6h3hHi0Va527FoBZc3aWyuRa1NLcC4GyKkEDZCjjCRq7YlerrMRDhNkfyo\nNOpKVd6WuZqzvbY+1vA3cdZzMO+yOK0WNaomSDs9sTRnOnP5b6QwicqEHtyZxlx3\nKxuvrjARfWDMMTVO6qiylBqjUnpY/KZbx93o/l1ieQKBgQD28ut1y5mhDTkH/OjS\neYCaN2w9Ku4g8pRYhFr0/rx16utS8OPN0UFqXn01tu2hejp1wEBRMM7pp6MFuh4b\nlZfAL/0hDjUh9V4ZJBi0DIvZZpqPqF/uJ9VEmEb/jGPJcvS1zSstnvdE3sErqqtN\njroTYL+1AeH3Gr4VGaKRMwRcpQKBgQDGnZ/otos4lBugaUOBMrwVHMLfrXLOrlbH\nrBfmGhi5OW5Q4HL4L4yg5GUAwiUYd2HXSgo0RJP+0hFWpmZ9KoBdjBRMHA6kcJHy\nDZICuvHQTWBlC/efJ7eur7bozbj6xtywBy0PEzuNkLuHIdus3osJ8s8io24oYPNm\nJJWvJSE9+QKBgATcXzogWdPLuNWpasPJ1Hg0oxLJJ4rKe5UKdefgo8EGcL9fMny4\no7r+RSSrhx3olAIBWMLAXTJINHNGaJVOaoBD8Y2XBAC5HbMM/Nd+b7pFxMETJWBA\ntHf3L16UWtp6QsrZUQJC4McgQ1kisOCD8LG089ESSmpcwmUT7hlBkdJpAoGAJ25V\nt+q9uw7UaUVcrIK5Cmv6WFPkDhpYii2lVP5rWCKJvy7ARHuULMELOFpS6QeSeh5t\n5jCTPSzRWmWQxVqxv2C3CuErGwRqRSbijP42Ucd60rTMhWFqOxkRdCibh9YBLEVQ\nccS8tv8767kSFsDb067L5rGRhhyxVd7/hJUXg2kCgYAmd7XUKMKTWyLkRe+/L6Uj\nHDrPaiYuVbd+ZvqgMpseqExeyOQ9oJ3DwHFjubL3uONnJ2IzH/IOzjbi/vItj8fO\njoLuMAvuAdIRZ/UxAX70sqkXignSxFOaT6+O4YNrP0bsnmHGIsIQE2EplBpPkLvV\nPd38ZtKnSdAJnfXvKIeljA==\n-----END PRIVATE KEY-----\n',
  client_email: 'firebase-adminsdk-fbsvc@futamart-1.iam.gserviceaccount.com',
};

async function getAccessToken(): Promise<string> {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const claim = btoa(JSON.stringify({
    iss: SERVICE_ACCOUNT.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }));

  const pemContents = SERVICE_ACCOUNT.private_key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\n/g, '');

  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', binaryKey.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );

  const signingInput = header + '.' + claim;
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const jwt = signingInput + '.' + btoa(String.fromCharCode(...new Uint8Array(signature)));

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + jwt,
  });

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

serve(async (req) => {
  try {
    const { token, title, body } = await req.json();
    const accessToken = await getAccessToken();

    const res = await fetch(
      'https://fcm.googleapis.com/v1/projects/futamart-1/messages:send',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token,
            notification: { title, body },
            android: { priority: 'high' },
            apns: { payload: { aps: { sound: 'default' } } },
          },
        }),
      }
    );

    const data = await res.json();
    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
