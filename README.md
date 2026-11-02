# Landingspagina Ember Root

Vibe-coded landingspagina (HTML, CSS en vanilla JS, geen build-stap). Design: Figma-pagina **Landingspagina** in https://www.figma.com/design/i3cNA66sjmRMFmXnVAIt4a

## Bestanden
| Bestand | Inhoud |
|---|---|
| `index.html` | Pagina: nav, hero, kruidenband, ons verhaal, smaken, ritueel, nieuwsbrief, footer |
| `style.css` | Opmaak met de brandkit-kleuren, Fraunces + Commissioner, responsive (390 / 900 / 1100 px), reduced motion |
| `script.js` | Interacties |
| `img/` | Weboptimalisaties (WebP + JPG) van de beelden uit `Socials/bewerkt/`, de video (verkleind uit `assets/gemini_generated_video_b9427e2b.mp4`), logo's en favicon |

## Minimumvereisten
- Hero, verhaal (over het merk) en CTA-secties: ja
- Visuals: 8 foto's en 1 video
- Embedded newsletter sign-up form: MailerLite-form **ER_Signup_Nieuwsbrief** (voornaam, e-mail, verplichte opt-in, double opt-in, groep Newsletter). Originele embedcode in `nieuwsbrief/mailerlite_form_embed.html`; de opmaak van MailerLite is vervangen door eigen CSS, de form-action en het MailerLite-script zijn behouden.

## Interacties
- Nav wordt compacter met blur bij scrollen, actieve sectie onderlijnd
- Hero-titel komt woord per woord binnen; klok telt van 07:00 naar 15:00; tellers lopen op
- Vallende kruiden (canvas) en muis-parallax op de hero-foto; draaiende stempel bij scrollen
- Oneindige kruidenband, pauzeert bij hover
- Quote kleurt woord per woord op tijdens het scrollen; parallax op de verhaalbeelden; video speelt af in beeld, met pauzeknop
- Smaakkaarten: 3D-tilt richting de muis, klik of tik draait de kaart om naar de tasting notes
- Stappen lichten op tijdens het scrollen; werkende trektimer van 4:00
- Na inschrijven: bedankbericht met stoomanimatie
- Alles respecteert `prefers-reduced-motion`

## Publiceren op GitHub Pages
1. Maak op GitHub een nieuwe publieke repository, bv. `ember-root`.
2. Upload de inhoud van deze map (`index.html`, `style.css`, `script.js`, `img/`) naar de root van de repo.
3. Settings → Pages → Source: *Deploy from a branch*, branch `main`, map `/ (root)`.
4. Na een minuut staat de pagina op `https://<gebruikersnaam>.github.io/ember-root/`.

Let op: echte inschrijvingen werken pas als het afzenderdomein in MailerLite geverifieerd is.
