// Cloudflare Pages middleware — send www.wildatlasapp.com to the apex.
//
// The site answers on both hosts. FoldBack's feedback widget only accepts the
// registered origin (https://wildatlasapp.com), so a visitor on www could open
// the Feedback button but every Send was refused ("not a registered site").
// Redirecting www to the apex keeps everyone on the one registered address and
// gives the site a single canonical host.
//
// Only the exact www host is redirected. *.pages.dev previews, the review copy
// and local dev fall through untouched. Path and query string are preserved.
// 301 so search engines and caches move to the apex.

const WWW_HOST = 'www.wildatlasapp.com';
const APEX_HOST = 'wildatlasapp.com';

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === WWW_HOST) {
    url.protocol = 'https:';
    url.hostname = APEX_HOST;
    url.port = '';
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
