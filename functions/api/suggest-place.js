// Cloudflare Pages Function — "Don't see your place?" form on /zoos/ (getwildatlas#38).
// Stores the suggestion in the D1 table place_suggestions (wildatlas-places). Nothing is added to the finder automatically: a person reviews each row.
//
// Needs a D1 binding named PLACES_DB → wildatlas-places (Cloudflare Pages → Settings → Bindings, Production + Preview).
// No tracking, no cookies; the email is used only to follow up about the place.

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const clean = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max);

export async function onRequestPost({ request, env }) {
  // same-origin only (a plain cross-site form post carries a foreign Origin)
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return json(403, { ok: false, error: 'Not allowed.' });
  let d = {};
  try { d = await request.json(); } catch (_) { return json(400, { ok: false, error: 'Please try again.' }); }
  if (d.company) return json(200, { ok: true });   // honeypot: bots fill the hidden field; pretend it worked
  const establishment = clean(d.establishment, 160), email = clean(d.email, 160), animal = clean(d.animal, 160), address = clean(d.address, 300);
  let website = clean(d.website, 300);
  if (!establishment) return json(400, { ok: false, error: 'Please add the name of the place.' });
  if (!EMAIL_RE.test(email)) return json(400, { ok: false, error: 'Please add a valid contact email.' });
  if (!address) return json(400, { ok: false, error: 'Please add the address.' });
  if (website) {
    if (!/^https?:\/\//i.test(website)) website = 'https://' + website;
    try { const u = new URL(website); if (!/^https?:$/.test(u.protocol) || !u.hostname.includes('.')) throw 0; website = u.toString(); } catch (_) { return json(400, { ok: false, error: 'That website link does not look right.' }); }
  }
  if (!env.PLACES_DB) return json(503, { ok: false, error: 'The form is not switched on yet. Please email info@wildatlasapp.com.' });
  try {
    await env.PLACES_DB.prepare('INSERT INTO place_suggestions (establishment, contact_email, animal, address, website, source_page) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(establishment, email, animal || null, address, website || null, clean(d.page, 120) || null).run();
  } catch (e) { return json(500, { ok: false, error: 'Sorry, that did not go through. Please email info@wildatlasapp.com.' }); }
  return json(200, { ok: true });
}
