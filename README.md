# Tamai Shop – landing page
Static site: no build step. Edit `assets/app.js` CONFIG, replace every `TODO` and `YOURDOMAIN.com`, swap `assets/img/hero.svg` for real WebP photos.

## 1. Orders -> Google Sheet
1. New Google Sheet -> Extensions -> Apps Script -> paste `apps-script/Code.gs`.
2. Deploy -> New deployment -> Web app -> Execute as: Me, Who has access: Anyone.
3. Copy the web app URL into `CONFIG.endpoint` in `assets/app.js`. (Re-deploy as a new version after any script edit.)

## 2. GitHub
git init && git add . && git commit -m "init" && git branch -M main
git remote add origin https://github.com/YOURUSER/tamai-shop.git && git push -u origin main

## 3. Go live on Cloudflare Pages (recommended; uses _headers)
Cloudflare dashboard -> Workers & Pages -> Create -> Pages -> Connect to Git -> pick the repo.
Framework preset: None. Build command: (empty). Output directory: `/`. Deploy.
Then Custom domains -> add your domain (DNS is created automatically if the domain is on Cloudflare). Turn on Always Use HTTPS.

## Alternative: GitHub Pages + Cloudflare DNS
Repo Settings -> Pages -> Deploy from `main` / root. Add a `CNAME` file containing your domain. In Cloudflare DNS add CNAME `@` -> `YOURUSER.github.io` (proxy on) and set SSL mode Full. (`_headers` is ignored on GitHub Pages.)

## 4. Before ads
Set `gtmId`, build GA4 / Google Ads / Meta tags in GTM on the `view_item`, `begin_checkout`, `purchase` events, test with GTM Preview, fill real policy pages, update canonical/OG/sitemap domain.
