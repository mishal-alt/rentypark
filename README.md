# RentyPark

Multi-tenant SaaS platform for rental parking stations. See [CLAUDE.md](CLAUDE.md) for full product context, domain rules, and conventions.

## Stack

- **Backend:** Node.js + Express + MongoDB (Mongoose), JWT auth — `server/`
- **Frontend:** React + Vite + Tailwind CSS — `client/`

## Getting started

Requires MongoDB running locally (or set `MONGO_URI` to a remote instance).

```bash
npm install                # installs both workspaces

cp server/.env.example server/.env
cp client/.env.example client/.env

npm run dev:server         # http://localhost:4000
npm run dev:client         # http://localhost:5173
```

## Testing

```bash
npm run test:server        # pricing engine unit tests
```

## Project structure

```
server/src/
  models/        Station, User, RatePlan, ParkingSession, Payment
  services/      pricingEngine.js — pure charge calculation, unit tested
  utils/         tenantScope.js (stationId-scoped queries), plate.js (normalization)
  middleware/     auth.js — JWT verification + role guards
  controllers/    request handlers
  routes/         Express routers, mounted under /api

client/src/
  pages/          one file per route (Dashboard, CheckIn, ActiveVehicles, History, RatePlans, Slots, Settings, Login, Signup)
  components/     Sidebar, AppLayout, CheckoutModal, shared Card/StatCard
  context/        AuthContext — JWT session stored in localStorage
  api/client.js   axios instance with auth interceptor
```

## Core flow

1. Station admin signs up (`/signup`) → creates station + admin user.
2. Admin configures slot capacity (`/slots`) and rate plans per vehicle type (`/rate-plans`).
3. Operator checks a vehicle in (`/check-in`) — blocked if the plate already has an active session or the vehicle type is full.
4. Vehicle shows on `/active` with a live duration; checkout opens a modal that quotes the charge server-side, then records cash/UPI payment.
5. Closed sessions appear in `/history`, filterable by plate, vehicle type, and date range.

All money is stored as integer paise; all charge/duration math happens server-side in `pricingEngine.js`, never on the client.
