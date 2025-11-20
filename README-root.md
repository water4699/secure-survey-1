# Privacy Credit Score DApp (FHE)

A minimal MVP demonstrating a privacy-preserving credit scoring DApp using Zama FHE on EVM. Users submit financial inputs (assets, income, expenses), which are encrypted client-side, scored on-chain in the encrypted domain, and decrypted by the user.

- All code and docs are in English.
- Frontend integrates RainbowKit wallet (top-right) and imports Rainbow CSS.
- Contract, deploy, and tests follow the fhevm-hardhat-template style (see FHECounter references).

## Monorepo Layout

- `hardhat/` — Smart contracts, Hardhat config, deploy script, tests
- `frontend/` — Next.js app with RainbowKit, encryption/decryption flow, branding

## Quick Start

Prerequisites:
- Node.js LTS (>=18)
- pnpm or npm

Install dependencies:
```bash
cd hardhat && pnpm install
cd ../frontend && pnpm install
```

Environment setup:
- Configure your RPC and private key in `hardhat/.env` (copy `.env.example`).

Build, test, and deploy:
```bash
cd hardhat
pnpm test
pnpm run deploy:local   # or deploy:sepolia if configured
```

Run frontend:
```bash
cd ../frontend
pnpm dev
```

## Business Flow (MVP)
1. User enters financial data (assets, income, expenses) in the UI.
2. Inputs are encrypted locally (client) using Zama FHE tools.
3. Contract computes the credit score fully in the encrypted domain.
4. Encrypted score is stored and can be retrieved.
5. User decrypts the score locally to view their result.

## Testing
- Tests are modeled after `FHECounter.ts`/`FHECounterSepolia.ts` patterns to validate encrypted ops and round-trip encrypt → compute → decrypt.

## Branding
- Custom logo (`/public/logo.svg`) and favicon are included and wired to the app.

## Notes (Chinese, business value)
See `NOTES_CN.md` for a short Chinese note describing the FHE value proposition.

