# CLAUDE.md

This file gives Claude Code (and any AI assistant) the context it needs to work productively on this project. Keep it updated as the system evolves.

---

## 1. Project Overview

**Product name:** RentyPark

**What it is:** A multi-tenant SaaS platform for rental parking stations. Any parking station across Kerala (and beyond) can sign up and use the system to register incoming vehicles, track parking duration, and automatically calculate charges when a vehicle leaves.

**The core idea in one line:** A vehicle enters a parking station → security records its number plate → the system starts a timer → when the vehicle leaves, the system calculates how long it stayed and charges the customer based on rates the station has configured.

**Business model:** SaaS. Each parking station is a tenant. Stations subscribe to use the platform and configure their own pricing.

---

## 2. Core Concepts / Domain Glossary

- **Station (Tenant):** A parking station that subscribes to the platform. Each station is isolated from others (multi-tenancy).
- **Operator / Security:** A staff member at a station who registers vehicle entry and exit.
- **Vehicle:** Identified by its number plate (license plate). No pre-registration needed — it's recorded on entry.
- **Parking Session:** One full cycle of a vehicle entering and leaving. Has an entry time, exit time, duration, and final charge.
- **Entry (Check-in):** The moment a vehicle arrives. Operator records the plate; timer starts.
- **Exit (Check-out):** The moment a vehicle leaves. System computes duration and price.
- **Rate Plan / Pricing Rule:** Station-configurable pricing per vehicle type (e.g., first hour ₹X, each additional hour ₹Y).
- **Slot:** A physical parking spot. Stations track total capacity per vehicle type and current occupancy.

---

## 3. Core Workflow (The Happy Path)

1. Vehicle arrives at the parking station.
2. Operator records the number plate and vehicle type → a new Parking Session is created with `entryTime = now`, scoped to the operator's station. Slot occupancy for that vehicle type increments.
3. The vehicle is parked. The session stays active/open.
4. Vehicle leaves. Operator searches/selects the plate from the active list.
5. System calculates `durationMinutes = exitTime - entryTime`.
6. System applies the station's rate plan (snapshotted at entry) for that vehicle type to the duration → produces the charge, honoring grace period and daily cap.
7. Operator records payment method (cash or UPI/online). Charge is shown/collected, session is marked closed, slot occupancy decrements, and a receipt/record is stored.

---

## 4. Decided Scope (this build)

Built as one comprehensive release (no separate MVP/Phase-2 split):

- Station signup & login (multi-tenant accounts), operator login per station, role-based access (`admin` | `operator`).
- Vehicle check-in (plate + vehicle type, auto-start timer).
- Vehicle check-out (search plate, auto-calculate duration & charge, record payment).
- **Vehicle-type-based rate plans** (car / bike / auto / truck / bus, each independently configurable). One active rate plan per vehicle type per station — enforced by a unique index, edit in place rather than creating duplicates.
- **Slot/capacity tracking** per vehicle type per station (occupancy shown live).
- **Online/UPI payment** recording alongside cash. The checkout UPI tab generates a scannable UPI QR code (standard `upi://pay` deep link) using the station's configured UPI ID (set in Settings) and the exact charge amount, so the customer's UPI app pre-fills the payee and amount — the operator still taps Confirm after the customer pays. Razorpay order creation also exists as a separate scaffold (webhook stubbed) for stations that want gateway-based online payment instead of a static VPA QR.
- List of active (currently parked) vehicles with live duration.
- Session history with search/filter (date range, plate, vehicle type) and pagination.
- Dashboard with live occupancy and today's revenue/check-ins stats.
- Dedicated Revenue page: today/this-month/all-time totals, daily (31-day) and monthly (12-month) revenue charts, and breakdowns by vehicle type and payment method — all aggregated server-side (`GET /api/revenue/summary`), grouped by IST calendar day/month.
- **Camera plate scanning** on Check-In and Active Vehicles, via `client/src/components/PlateScannerModal.jsx`: opens the device camera, captures a photo, runs free in-browser OCR (`tesseract.js`, lazy-loaded) to read the plate, then shows an editable confirm step before using it — manual typing remains the default/fallback everywhere. On Active Vehicles, a successful scan matches against the currently active sessions (client-side, best-effort fuzzy match) and opens that vehicle's checkout directly; vehicle type is never inferred from the camera, only the plate text.

Future ideas (not in this build): a paid/cloud ANPR API for higher accuracy than the in-browser OCR, loyalty/monthly passes, pre-booking, multi-station owner roll-up view, analytics/trends.

---

## 5. Pricing Logic (Important — get this right)

Pricing is per-station, per-vehicle-type configurable.

- **First hour:** a base rate (e.g., ₹20).
- **Each subsequent hour:** an additional rate (e.g., ₹10/hour).
- **Partial hours: round up to the next full hour.** This is the only rounding rule implemented in this build (per-minute pro-rata was considered and explicitly rejected for simplicity).
- **Grace period:** optional configurable free minutes at the start of a session (e.g., first 10 minutes free) — if the session ends within the grace period, charge is 0.
- **Daily cap:** optional maximum charge per 24-hour period; multi-day stays apply the cap per day and sum across days.

```
RatePlan {
  stationId
  vehicleType        # "car" | "bike" | "auto" | "truck" | "bus"
  firstHourRate
  additionalHourRate
  roundingRule        # "round_up" (fixed for this build)
  gracePeriodMinutes  # default 0
  dailyCap            # nullable
  active
}
```

Always compute charges on the **server**, never trust client-side totals. Store the exact rate plan values used at the time of the session on `ParkingSession.ratePlanSnapshot` so historical records stay accurate even if the station later changes its prices.

---

## 6. Data Model (MongoDB / Mongoose)

- **stations** — name, location, ownerContact, subscriptionStatus, vehicleTypes: [{ type, totalSlots }], upiId, createdAt
- **users** — stationId (ref), name, email, passwordHash, role (`admin` | `operator`)
- **ratePlans** — stationId (ref), vehicleType, firstHourRate, additionalHourRate, roundingRule, gracePeriodMinutes, dailyCap, active
- **parkingSessions** — stationId (ref), plateNumber (normalized), vehicleType, entryTime, exitTime (nullable), durationMinutes, chargeAmount (paise), status (`active`|`closed`), ratePlanSnapshot (embedded), paymentMethod, createdBy (ref users)
- **payments** — sessionId (ref), stationId (ref), amount (paise), method (`cash`|`upi`), razorpayOrderId, razorpayPaymentId, status, paidAt

**Multi-tenancy rule:** Every query that touches station data MUST be scoped by `stationId`. A station must never see another station's vehicles, rates, or revenue. Enforced via a Mongoose query-helper/plugin, not ad-hoc filters (see `server/src/utils/tenantScope.js`).

---

## 7. Tech Stack

- **Frontend:** React + Vite + Tailwind CSS. Sidebar-based SaaS dashboard, responsive for phone/tablet use by operators.
- **Backend:** Node.js + Express, REST API.
- **Database:** MongoDB via Mongoose.
- **Auth:** JWT, role-based access (`admin` vs `operator`).
- **Payments:** Razorpay (orders API + webhook scaffold) for UPI/online; manual cash recording.
- **Hosting:** undecided — design is cloud-agnostic (Render/Railway/AWS all viable).

Run instructions, env vars, and build/test/deploy commands are documented in the root `README.md` once scaffolding lands.

---

## 8. Edge Cases & Business Rules

- **Duplicate active plate:** Block a second open session for the same normalized plate at the same station.
- **Plate not found on exit:** Allow searching/editing the active list; plates are normalized (uppercase, spaces stripped) so "KL 13 AB 1234" and "KL13AB1234" match.
- **Overnight / multi-day stays:** Charges keep accruing; daily cap applies per 24h period.
- **Clock/timezone:** Store all times in UTC; display in IST (Asia/Kolkata) in the UI.
- **Rate change mid-session:** Use the snapshot stored at entry, never the current rate plan.
- **Slot full:** Block check-in for a vehicle type once occupancy reaches `totalSlots`, with a clear UI message.

---

## 9. Conventions for Claude

- Always scope by `stationId` when reading or writing station data — use the shared tenant-scoping helper.
- Compute money and durations on the server. Never trust the client.
- Store currency as integer paise — never floats.
- Use IST (Asia/Kolkata) for display; store UTC in the DB.
- Keep functions small and readable; this is a real product staff rely on daily.
- Prefer clear, boring, correct solutions over clever ones — billing logic must be trustworthy.
- Write tests for the charge calculation logic specifically (`server/src/services/pricingEngine.js`); it's the heart of the product.
- When adding a feature, update this CLAUDE.md and the data model section.

---

*Keep this file current as the system evolves.*
