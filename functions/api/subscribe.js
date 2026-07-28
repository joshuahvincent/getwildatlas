// Cloudflare Pages Function — parent email capture → beehiiv (getwildatlas#18).
//
// Plain HTML form POSTs here (or JS fetch). We call the beehiiv API server-side so
// the API key never reaches the browser. Double opt-in is forced per request, and
// the placement (blog-footer | homepage) is passed as a UTM source so blog vs home
// conversion stays separable in beehiiv.
//
// Env (set in Cloudflare Pages → Settings → Environment variables, Production+Preview):
//   BEEHIIV_API_KEY          — secret (Bearer token)
//   BEEHIIV_PUBLICATION_ID   — e.g. pub_xxxxxxxx

const ALLOWED_SOURCES = new Set(['blog-footer', 'homepage', 'newsletter-page']);
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Newsletter-signup incentive: a free Farm Friends pack via a shared App Store
// offer code, revealed only after a successful subscribe (getwildatlas#18).
const OFFER = {
  code: 'INFORMED2026',
  pack: 'Farm Friends',
  redeemUrl: 'https://apps.apple.com/redeem?ctx=offercodes&id=6761081031&code=INFORMED2026',
};

function htmlPage(status, heading, body) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${heading} — Wild Atlas</title>
<link rel="stylesheet" href="/css/styles.css?v=2">
<style>body{display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;background:var(--creamy-coat,#FFF5E1);font-family:'Nunito',sans-serif;padding:24px}
.box{max-width:460px;text-align:center;background:#fff;border:1.5px solid rgba(93,64,55,.1);border-radius:20px;padding:40px 32px}
h1{font-family:'Fredoka',sans-serif;color:#5D4037;margin:0 0 12px}p{color:#5D4037;opacity:.85;line-height:1.6;margin:0 0 20px}
a{color:#E68A6A;font-weight:700;text-decoration:none}</style></head>
<body><div class="box"><h1>${heading}</h1><p>${body}</p><a href="/">← Back to Wild Atlas</a></div></body></html>`;
  return new Response(html, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Parse either JSON (fetch) or form-encoded (native POST fallback).
  let data = {};
  const ct = request.headers.get('content-type') || '';
  try {
    if (ct.includes('application/json')) {
      data = await request.json();
    } else {
      const form = await request.formData();
      data = Object.fromEntries(form);
    }
  } catch (_) {
    data = {};
  }

  const wantsJSON =
    (request.headers.get('accept') || '').includes('application/json') ||
    ct.includes('application/json');

  const email = String(data.email || '').trim();
  const consent = data.consent === 'on' || data.consent === 'true' || data.consent === true || data.consent === '1';
  const rawSource = String(data.source || '').trim();
  const source = ALLOWED_SOURCES.has(rawSource) ? rawSource : 'website';

  const respond = (status, ok, msg, heading) =>
    wantsJSON
      ? new Response(JSON.stringify({ ok, error: ok ? undefined : msg }), {
          status,
          headers: { 'content-type': 'application/json' },
        })
      : htmlPage(status, heading || (ok ? 'Almost there!' : 'Something went wrong'), msg);

  if (!EMAIL_RE.test(email)) {
    return respond(400, false, 'Please enter a valid email address.');
  }
  if (!consent) {
    return respond(400, false, 'Please tick the consent box so we know you agree to receive email.');
  }

  // Publication ID is not secret (it appears in beehiiv's public embed URLs), so
  // it's baked in as a default and only the API key needs to be a Cloudflare secret.
  const pubId = env.BEEHIIV_PUBLICATION_ID || 'pub_3a9cf204-e07b-418b-8157-e1509dcb36c3';
  const apiKey = env.BEEHIIV_API_KEY;
  if (!apiKey) {
    console.log('subscribe: missing BEEHIIV_API_KEY');
    return respond(503, false, 'Email signup is temporarily unavailable. Please try again later.');
  }

  let beehiivRes;
  try {
    beehiivRes = await fetch(
      `https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          email,
          reactivate_existing: false,
          send_welcome_email: false,
          double_opt_override: 'off', // single opt-in — active immediately, no confirmation email (consent = the un-ticked checkbox on the form)
          utm_source: source, // blog-footer | homepage — separable in beehiiv
          utm_medium: 'website',
          utm_campaign: 'parent-email',
          referring_site: request.headers.get('referer') || url.origin,
        }),
      }
    );
  } catch (err) {
    console.log('subscribe: fetch to beehiiv failed', String(err));
    return respond(502, false, 'We could not sign you up right now. Please try again later.');
  }

  if (!beehiivRes.ok) {
    const detail = await beehiivRes.text().catch(() => '');
    // Already-subscribed is not a failure — reveal the offer so returning
    // parents still get their code.
    const alreadySubscribed =
      beehiivRes.status === 409 || /already|exists|duplicate/i.test(detail);
    if (!alreadySubscribed) {
      console.log('subscribe: beehiiv non-2xx', beehiivRes.status, detail.slice(0, 500));
      return respond(502, false, 'We could not sign you up right now. Please try again later.');
    }
  }

  // Success — reveal the free-pack offer code.
  if (wantsJSON) {
    return new Response(
      JSON.stringify({ ok: true, offerCode: OFFER.code, redeemUrl: OFFER.redeemUrl, packName: OFFER.pack }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    );
  }
  return offerSuccessPage();
}

// Rich no-JS success page: confirmation + offer code + redeem link + how-to.
function offerSuccessPage() {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>You're subscribed — Wild Atlas</title>
<link rel="stylesheet" href="/css/styles.css?v=3">
<style>body{display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;background:var(--creamy-coat,#FFF5E1);font-family:'Nunito',sans-serif;padding:24px}
.box{max-width:520px;background:#fff;border:1.5px solid rgba(93,64,55,.1);border-radius:20px;padding:36px 32px;color:#5D4037}
h1{font-family:'Fredoka',sans-serif;margin:0 0 8px}
.code{font-family:'Fredoka',sans-serif;font-size:1.6rem;font-weight:700;letter-spacing:2px;background:#FFF5E1;border:1.5px dashed #E68A6A;border-radius:12px;padding:12px;text-align:center;margin:16px 0}
.cta{display:inline-block;background:#FF9E7D;color:#fff;font-family:'Fredoka',sans-serif;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:999px;margin:4px 0 16px}
ol{padding-left:1.2rem;line-height:1.7;font-size:.95rem}
a{color:#E68A6A;font-weight:700}</style></head>
<body><div class="box">
<h1>You're in! 🎉</h1>
<p>Here's your free <strong>Farm Friends</strong> pack code — enter it in the App Store to unlock it.</p>
<div class="code">${OFFER.code}</div>
<a class="cta" href="${OFFER.redeemUrl}">Redeem in the App Store</a>
<p><strong>How to redeem:</strong></p>
<ol>
<li>On your iPhone or iPad, tap <strong>Redeem in the App Store</strong> above — the code applies automatically.</li>
<li>Or open the <strong>App Store</strong> app → tap your profile (top-right) → <strong>Redeem Gift Card or Code</strong> → enter <strong>${OFFER.code}</strong>.</li>
</ol>
<p>Then open Wild Atlas and the Farm Friends pack will be unlocked. It's yours to keep, even if you unsubscribe.</p>
<a href="/">← Back to Wild Atlas</a>
</div></body></html>`;
  return new Response(html, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

// Any non-POST method: 405.
export async function onRequest(context) {
  if (context.request.method === 'POST') return onRequestPost(context);
  return new Response('Method Not Allowed', {
    status: 405,
    headers: { allow: 'POST' },
  });
}
