# 🌅 SolBridge — Cross-Chain Migration Suite Built on Solana

![Solana](https://img.shields.io/badge/Built_on-Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white)
![Sunrise](https://img.shields.io/badge/Powered_by-Sunrise-F97316?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

> **Solana Graveyard Hackathon 2026 — Sunrise Migrations Track**

SolBridge is a cross-chain migration toolkit **built on Solana** that helps projects and users migrate assets, contracts, and wallets from EVM chains to Solana. Every key workflow — bridging, migration, analytics — executes **real on-chain transactions** on the Solana blockchain.

**Live**: [solbridge.vercel.app](https://solbridge.vercel.app) · **Repo**: [github.com/edoh-Onuh/solbridge](https://github.com/edoh-Onuh/solbridge)

---

## 🔗 How SolBridge Is Built on Solana

SolBridge is not just a frontend referencing Solana — it **reads from and writes to the Solana blockchain** in every major user flow:

| Feature | On-Chain Interaction | Solana Programs Used |
|---------|---------------------|---------------------|
| **Bridge** | Records bridge intents on-chain via Memo Program; real tx signature from wallet | Memo Program (`MemoSq4g…`) |
| **Migrate** | Records migration operations on-chain; reads real SOL + SPL token balances | Memo Program, Token Program, System Program |
| **Analytics** | Fetches live transaction data from Solana mainnet (Token Program signatures, parsed transactions) | Token Program (`TokenkegQ…`), System Program |
| **Network Stats** | Reads real TPS, current slot, and block time from Solana RPC | `getRecentPerformanceSamples`, `getSlot` |
| **Wallet** | Connects Phantom/Solflare via Solana Wallet Adapter; displays real public key and balance | Wallet Adapter, `getBalance`, `getAccountInfo` |
| **Token Accounts** | Fetches real SPL token holdings for any connected wallet | `getParsedTokenAccountsByOwner` |

### Real Solana RPC Calls (Server-Side)

```
lib/solana-data.ts
├── getSignaturesForAddress()       → Fetch recent Token Program tx signatures
├── getParsedTransactions()         → Batch-parse transaction details (balance changes, fees, accounts)
├── getBalance()                    → Read SOL balance for any public key
├── getAccountInfo()                → Read account metadata (owner, executable, lamports)
├── getParsedTokenAccountsByOwner() → List all SPL token accounts with balances
│
app/api/network-stats/route.ts
├── getRecentPerformanceSamples()   → Live TPS calculation
└── getSlot()                       → Current slot number
```

### Real Solana Transactions (Client-Side)

Both the **Bridge** and **Migrate** pages create and send real Solana transactions using the Memo Program. When a user bridges or migrates, they sign a real transaction in their Phantom/Solflare wallet. The resulting transaction signature is verifiable on [Solscan](https://solscan.io).

```typescript
// Bridge intent recorded on-chain via Memo Program
const memoIx = new TransactionInstruction({
  keys: [{ pubkey: walletPubkey, isSigner: true, isWritable: true }],
  programId: MEMO_PROGRAM_ID, // MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr
  data: Buffer.from(JSON.stringify({
    app: 'SolBridge', action: 'bridge',
    from: 'ethereum', to: 'solana',
    token: 'USDC', amount: '100', ...
  })),
});
const signature = await sendTransaction(tx, connection); // Real Solana transaction
```

---

## ✨ Features

### 🌅 Sunrise Bridge (`/bridge`)
Cross-chain asset bridge interface designed for Sunrise protocol integration.
- **6 EVM source chains**: Ethereum, BNB Chain, Polygon, Avalanche, Arbitrum, Base
- **4 bridge tokens**: USDC, USDT, ETH, WBTC
- **Real wallet connection**: Phantom/Solflare via Solana Wallet Adapter
- **On-chain bridge intent**: Every bridge records a Memo transaction on Solana
- **Real SOL balance display**: Reads balance from Solana RPC on wallet connect
- **Verifiable Solscan links**: Tx signatures link to real Solscan explorer pages

### 🔄 Wallet Migration (`/migrate`)
Migrate assets from EVM addresses to your Solana wallet.
- **EVM address input** with 0x validation
- **Solana wallet destination** with real on-chain balance + SPL token count
- **On-chain migration record**: Memo transaction stores migration metadata on Solana
- **Real balance reads**: Fetches SOL balance and SPL token accounts from mainnet
- **3-step progress stepper**: Connect → Review → Confirm

### 🤖 AI Contract Converter (`/convert`)
Convert Solidity smart contracts to Rust/Anchor for Solana deployment.
- **GPT-4o powered**: Calls OpenAI API for Solidity → Rust/Anchor conversion
- **Side-by-side code view** with syntax highlighting (VS Code dark theme)
- **Conversion stats**: Lines, functions, structs, complexity analysis
- **Download as .rs**: Export converted Anchor code directly
- **Graceful fallback**: Demo conversion available when API key isn't configured

### 📊 Live Analytics (`/analytics`)
Real-time Solana mainnet analytics dashboard.
- **Live transaction data**: Reads from Token Program via `getSignaturesForAddress` + `getParsedTransactions`
- **7-day volume chart**: Area chart of transaction volume from real data
- **Program distribution**: Pie chart breakdown by Token Transfer, System Transfer, etc.
- **Transaction table**: Real signatures with working Solscan links
- **30-second auto-refresh**: Polls Solana RPC for latest data
- **Network stats**: Live TPS, current slot, block time from `getRecentPerformanceSamples`
- **Data source indicator**: Shows Live / Cached / Offline status

### 📘 Migration Guide (`/sunrise-guide`)
Interactive 6-step guide for migrating to Solana using Sunrise.
- Steps: Overview → Wallets → Bridge → Convert → List on Sunrise → Monitor
- Progress tracking with sidebar navigation
- Links to Phantom, Solflare, Jupiter, Orca, Sunrise, and other Solana ecosystem tools

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.1.6 (App Router, Turbopack) |
| **Language** | TypeScript 5.9, React 19.2 |
| **Blockchain** | `@solana/web3.js` 1.98.4 — Connection, Transaction, PublicKey, SystemProgram |
| **Wallet** | `@solana/wallet-adapter-react` — Phantom, Solflare adapters |
| **AI** | OpenAI GPT-4o (Solidity → Rust/Anchor conversion) |
| **Charts** | Recharts 3.7 (AreaChart, PieChart, BarChart) |
| **Styling** | Tailwind CSS 3.4 |
| **Icons** | Lucide React |
| **Code Display** | React Syntax Highlighter (VS Code Dark Plus theme) |

### Solana Dependencies

```json
{
  "@solana/web3.js": "^1.98.4",
  "@solana/wallet-adapter-base": "^0.9.27",
  "@solana/wallet-adapter-react": "^0.15.39",
  "@solana/wallet-adapter-react-ui": "^0.9.39",
  "@solana/wallet-adapter-wallets": "^0.19.37"
}
```

---

## 📁 Project Structure

```
solbridge/
├── app/
│   ├── page.tsx                   # Landing page (live TPS, wallet connect)
│   ├── bridge/page.tsx            # Sunrise bridge (real Memo tx on Solana)
│   ├── migrate/page.tsx           # Wallet migration (real Memo tx + balance reads)
│   ├── convert/page.tsx           # AI contract converter (GPT-4o)
│   ├── analytics/page.tsx         # Live mainnet analytics dashboard
│   ├── sunrise-guide/page.tsx     # Interactive migration guide
│   ├── layout.tsx                 # Root layout with WalletProvider
│   ├── globals.css                # Global styles + wallet adapter CSS
│   └── api/
│       ├── analytics/route.ts     # Real Solana tx data (getSignaturesForAddress)
│       ├── account-info/route.ts  # Real balance + account info (getBalance)
│       ├── network-stats/route.ts # Real TPS + slot (getRecentPerformanceSamples)
│       ├── wallet-tokens/route.ts # Real SPL token accounts (getParsedTokenAccountsByOwner)
│       └── convert/route.ts       # OpenAI GPT-4o Solidity→Rust conversion
├── components/
│   └── WalletProvider.tsx         # Solana ConnectionProvider + WalletAdapter config
├── lib/
│   └── solana-data.ts             # Solana RPC data layer (7 real RPC methods)
├── next.config.js                 # Solana web3.js compatibility config
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Solana wallet (Phantom or Solflare)
- Optional: OpenAI API key for AI contract conversion
- Optional: Custom Solana RPC endpoint (defaults to public mainnet)

### Installation

```bash
git clone https://github.com/edoh-Onuh/solbridge.git
cd solbridge
npm install
```

### Environment Variables

Create `.env.local`:

```env
# Optional: OpenAI key for AI contract conversion
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Custom Solana RPC (defaults to https://api.mainnet-beta.solana.com)
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### Run

```bash
npm run dev      # Development server at http://localhost:3000
npm run build    # Production build
npm run start    # Production server
```

---

## 📡 Solana RPC Methods Used

| Method | File | Purpose |
|--------|------|---------|
| `getSignaturesForAddress` | `lib/solana-data.ts` | Fetch recent Token Program transaction signatures |
| `getParsedTransactions` | `lib/solana-data.ts` | Batch-parse transaction details (balances, fees, accounts) |
| `getBalance` | `lib/solana-data.ts`, `bridge/page.tsx` | Read SOL balance for any address |
| `getAccountInfo` | `lib/solana-data.ts` | Read account metadata (owner, executable, lamports) |
| `getParsedTokenAccountsByOwner` | `lib/solana-data.ts` | List SPL token accounts with balances |
| `getRecentPerformanceSamples` | `api/network-stats` | Calculate live network TPS |
| `getSlot` | `api/network-stats` | Read current slot number |
| `sendTransaction` | `bridge/page.tsx`, `migrate/page.tsx` | Send real Memo transactions via wallet adapter |
| `confirmTransaction` | `bridge/page.tsx`, `migrate/page.tsx` | Confirm on-chain transaction finality |

### Solana Program IDs Referenced

| Program | ID | Usage |
|---------|-----|-------|
| **Memo Program** | `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr` | On-chain bridge/migration records |
| **Token Program** | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` | Transaction analytics, token accounts |
| **Associated Token** | `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL` | Program distribution analytics |
| **System Program** | `11111111111111111111111111111111` | Transfer detection, account reads |
| **Compute Budget** | `ComputeBudget111111111111111111111111111111` | Program distribution analytics |

---

## 🔒 Security

- **Non-custodial**: SolBridge never accesses private keys; all transactions are signed client-side via wallet adapter
- **Open source**: All code is transparent and auditable
- **Read-only server-side**: API routes only read from Solana RPC, never sign transactions
- **Client-side signing**: Bridge and migration transactions are signed exclusively in-wallet (Phantom/Solflare)

---

## 🎯 Hackathon Context

**Track**: Sunrise Migrations — *"Help projects migrate to Solana from other ecosystems. Build bridges, migration tooling, or onboarding guides using Sunrise."*

**What SolBridge delivers**:
1. **Bridge tooling** — Sunrise-branded cross-chain bridge UI with real on-chain Solana transactions
2. **Migration tooling** — Wallet + contract migration suite with on-chain migration records
3. **Onboarding guide** — Interactive 6-step guide for migrating to Solana via Sunrise ecosystem
4. **Live analytics** — Real Solana mainnet data dashboard showing network activity

**On-chain proof**: Every bridge and migration operation produces a real, verifiable Solana transaction viewable on [Solscan](https://solscan.io).

---

## 👤 Author

**Edoh Onuh** — [@edoh-Onuh](https://github.com/edoh-Onuh) · [@Adanubrown](https://x.com/Adanubrown)

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
