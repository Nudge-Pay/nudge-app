# Web deployment

Vercel builds this repository using `npm run build` and serves the generated `dist` directory. The root `vercel.json` sets these options explicitly. Expo uses static output, with HTML for each route and clean URLs; no catch-all rewrite is required.

The app defaults to a Stellar testnet preview, including public Horizon/RPC endpoints and the testnet USDC issuer from `.env.example`. It can build in Vercel's Production environment without environment variables; the hosting environment does not select Stellar mainnet. The welcome page identifies this as a testnet preview.

To override the preview configuration or enable mainnet, set the following public environment variables in Vercel for the environments you deploy:

- `EXPO_PUBLIC_STELLAR_NETWORK`
- `EXPO_PUBLIC_HORIZON_URL`
- `EXPO_PUBLIC_RPC_URL`
- `EXPO_PUBLIC_USDC_ISSUER`

Expo embeds these values in the browser bundle. Never put wallet secrets or private credentials in `EXPO_PUBLIC_` variables. Mainnet requires `EXPO_PUBLIC_STELLAR_NETWORK=mainnet`, explicit mainnet endpoints, and the correct issuer; missing values still fail the build and no testnet defaults are used.

To build locally, copy `.env.example` to `.env`, then run:

```sh
npm ci
npm run typecheck
npm run build
```

The build must produce `dist/index.html` and `dist/welcome.html`. Push to the connected production branch (`main`) to trigger Vercel. If deployment fails, inspect the Vercel build log for configuration or export errors.
