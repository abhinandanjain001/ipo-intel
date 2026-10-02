# IPO Intel

Indian IPO dashboard with current source-linked web data, five-minute refresh, mainboard/SME and status filters, search, and editable bearish/base/bullish profit-loss scenarios.

## Run

Requires Node.js 22 or newer. No runtime dependencies.

```sh
npm run dev
npm test
npm run build
```

Open http://localhost:3000. Deploy by importing this repository into Vercel, using Other as framework, `npm run build` as build command and `public` as output directory. `api/ipos.js` is a Vercel Node function. No API key is required for the default public InvestorGain feed. Source availability and layout may change; failure and cached-data states are shown explicitly.

## Data and estimates

Default feed: https://www.investorgain.com/report/live-ipo-gmp/331/ . Every request reads current source HTML on the server and normalizes the labeled table cells. Source reading time is displayed verbatim in IST separately from fetch time. A refreshed fetch does not imply a new source reading. Missing GMP is null, never fabricated or treated as an observed zero. No fabricated demo IPOs are included. This is polled web data, not an exchange tick stream.

Optional: configure `IPOGURU_API_KEY` server-side in Vercel to use the documented IPO Guru v2 calendar API: https://www.ipoguru.in/ipo-gmp-details-developer-api . Check provider plan quotas and republication terms before choosing a plan. Five-minute polling can exceed the evaluation plan. Keys must never be committed or sent to the browser.

Base estimate = issue price + GMP (or issue price if GMP is unknown). Bear/bull prices = base ± spread% of issue price, floored at zero. Profit = (scenario listing − issue price) × shares per lot × allotted lots − entered costs. This is transparent scenario arithmetic, not a trained or backtested forecasting model or a confidence interval. No probabilities or guaranteed returns are claimed. Allotment is not assured. Fees and taxes are user-supplied estimates.

Official verification: https://www.nseindia.com/market-data/all-upcoming-issues-ipo and the issue's prospectus. GMP is unofficial.

## Architecture

- `public/`: responsive dependency-free browser UI and calculation model.
- `api/ipos.js`: fixed-source fetch, 18-second timeout, five-minute cache, normalized data and explicit failures; API keys stay server-side.
- `server.mjs`: local preview server.
- `model.test.js`: financial arithmetic and missing-value checks.

The page uses source data only as escaped text. Source links are limited to provider hostnames. There is no trading or brokerage integration.

## Firebase Authentication

Dedicated Firebase project: `ipo-intel-9c07f` (Spark plan). Web app: IPO Intel Web. Email/password account creation, sign-in, password reset and sign-out use the Firebase modular SDK 12.19.0 from the official CDN. Sessions persist through Firebase's browser persistence. No password is stored by application code or sent to the IPO API.

The public Firebase web configuration lives in `public/firebase-config.js`; it is not an Admin SDK credential. No service account key is required. Configure providers and authorized domains in Firebase Authentication. The production domain is `ipo-intel-six.vercel.app`.

The dashboard and public market-data API remain public. Sign-in establishes account identity; it does not impose server authorization on the public IPO endpoint. Personal holdings use Firestore rules tied to the signed-in user’s UID; the public IPO API never handles portfolio data.


## Personal portfolio and research details

The dashboard displays offer size, opening/closing/listing dates, lot cost, source reading time and subscription demand when supplied by the feed. Missing values remain explicit. Benefits and a research checklist explain how to use the tools.

Signed-in users can add, edit, remove and export holdings. Firestore stores each holding under `users/{uid}/holdings/{holdingId}`. Deploy `firestore.rules` to the default database: users can access only their own path, and writes validate the schema and numeric bounds. Other paths are denied.

Portfolio marks are manually entered valuations or sale prices, not live stock quotes. Open cost includes fees; unrealized totals include only held positions with entered valuations. Sold positions contribute to realized profit/loss. Split partially sold positions into separate held and sold records. CSV exports neutralize leading spreadsheet formula characters.

Run `npm test` for profit/loss, missing valuation, input validation and CSV checks. No broker connection or order execution is provided.
