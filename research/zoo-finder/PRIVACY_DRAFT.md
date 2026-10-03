# Privacy policy: draft sentence for the /zoos/ page (getwildatlas#38). NOT applied; needs Josh's approval.

The privacy policy body lives in `js/legal-translations.js` (6 locales, shared with the app's About screen), so the edit must go through the `wild-atlas-i18n` skill and a Cole voice pass, and counsel-level wording stays Josh's call. Proposed English text, to sit under the website section:

> **Finding a zoo near you.** If you use the "Find a zoo" page on wildatlasapp.com, you can tell us roughly where you are by tapping "Use my location" or typing a city or postcode. That location is used only inside your browser to sort the list of places. It is not sent to us or added to the web address. To save you typing it again, the page remembers your location on your own device (in your browser's local storage), and you can clear it any time with "Forget my location". We do not use it for advertising or analytics. The page and its map are served from our own website, and photos on the page are stored on our site, so loading them does not contact other services.

Facts this sentence relies on (verified 2026-10-01 in the local build): geolocation runs only on a tap; coordinates and typed text stay in memory; the only requests are to our own domain; the site-wide Google Analytics tag still loads on the page (it records the page address, which contains only `?animal=<id>`), so the sentence says we do not add location to analytics rather than that no analytics runs. GA disclosure itself is still the deferred item from the 2026-08-11 note in CLAUDE.md.

## Added 2026-10-02: the "Add your place" form
The page also has a form for suggesting a zoo, aquarium or park that is missing. Proposed second paragraph for the same policy section:

> **Suggesting a place.** If you use the "Add your place" form, we collect the name of the place, its address and website, the animals you say it has, and your email address. We use your email only to ask about the place, and we do not add it to any mailing list. Submissions are stored in our database, and we use an email service (Resend) to alert our team when one arrives.

Facts verified in the build: the form posts only to our own domain (`/api/suggest-place`); a hidden field catches bots; nothing is sent to analytics except a count with no content (`zoo_suggest_submit`, `has_animal` yes/no).
