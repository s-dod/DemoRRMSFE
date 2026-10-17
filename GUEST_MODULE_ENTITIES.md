# Guest Module: Entities & Classes Specification

> **Module:** Guest (Bounded Context)  
> **Architecture:** Modular Monolithic  
> **Format:** Class & Entity Specification (No code implementation)

---

## 1. Guest Module Folder Structure

```text
src/modules/guest/
├── contracts/                        # Public API exposed to other modules
│   ├── guest-module-api.interface   # Synchronous facade methods
│   └── dtos/
│       ├── guest-summary.dto
│       └── guest-stay-eligibility.dto
├── domain/                           # Pure Domain Core
│   ├── enums/
│   │   ├── guest-vip-status.enum
│   │   ├── loyalty-tier.enum
│   │   ├── id-document-type.enum
│   │   ├── service-category.enum
│   │   ├── service-priority.enum
│   │   └── service-status.enum
│   ├── value-objects/
│   │   ├── guest-id.vo
│   │   ├── identification-document.vo
│   │   ├── guest-preferences.vo
│   │   └── loyalty-points.vo
│   ├── entities/
│   │   ├── guest.aggregate          # Aggregate Root
│   │   ├── loyalty-account.aggregate# Aggregate Root
│   │   ├── loyalty-transaction.entity
│   │   ├── service-request.aggregate# Aggregate Root
│   │   └── guest-feedback.entity
│   ├── events/
│   │   ├── guest-registered.event
│   │   ├── loyalty-tier-promoted.event
│   │   ├── service-request-created.event
│   │   ├── service-request-fulfilled.event
│   │   └── guest-feedback-received.event
│   └── repositories/
│       ├── guest-repository.interface
│       ├── loyalty-repository.interface
│       └── service-request-repository.interface
├── application/                      # Use Cases & Handlers
│   ├── commands/
│   ├── queries/
│   └── event-handlers/
│       └── on-stay-completed.handler # Cross-module event listener
└── infrastructure/                   # Persistence & Facade
    ├── persistence/
    └── facade/
        └── guest-module.facade
```

---

## 2. Enums & Value Objects

### 2.1 Enums

#### GuestVipStatus
* `STANDARD` — Regular verified guest.
* `SILVER_VIP` — Recognized repeat patron.
* `GOLD_VIP` — High-frequency luxury patron.
* `BLACK_LISTED` — Banned from making bookings or checking in.

#### LoyaltyTier
* `BRONZE` — Base membership tier (0 – 14,999 pts).
* `SILVER` — 15,000 – 39,999 pts (complimentary late checkout, welcome amenity).
* `GOLD` — 40,000 – 99,999 pts (complimentary room upgrades, dedicated concierge).
* `PLATINUM` — 100,000+ pts (presidential privileges, 24/7 butler, spa credits).

#### IdDocumentType
* `PASSPORT` — International passport.
* `NATIONAL_ID` — Government national identity card.
* `DRIVING_LICENSE` — State/national driver's license.

#### ServiceCategory
* `HOUSEKEEPING` — Extra towels, linens, cleaning, turndown service.
* `CONCIERGE` — Luggage handling, tour booking, airport transfer.
* `ROOM_SERVICE` — In-room dining and beverage orders.
* `MAINTENANCE` — HVAC adjustment, plumbing, electrical repairs.
* `SPA` — In-room wellness therapy, massage, appointment requests.

#### ServicePriority
* `LOW` — Non-urgent preference.
* `STANDARD` — Routine operational queue.
* `URGENT` — Immediate dispatch needed (spill, active equipment failure).

#### ServiceStatus
* `REQUESTED` — Submitted by guest from mobile/web portal.
* `ASSIGNED` — Allocated to on-duty staff member.
* `IN_PROGRESS` — Staff currently servicing room.
* `FULFILLED` — Completed and confirmed.
* `CANCELLED` — Revoked by guest or front desk.

---

### 2.2 Value Objects

#### GuestId
* **Inherits From:** `ValueObject`
* **Attributes:**
  * `value: UUID / string`
* **Purpose:** Strongly typed unique identifier for guests.

#### IdentificationDocument
* **Inherits From:** `ValueObject`
* **Attributes:**
  * `documentType: IdDocumentType`
  * `documentNumber: string` — Normalized uppercase number.
  * `issuingCountry: string` — 2-letter ISO country code.
  * `expiryDate: Date`
  * `isVerified: boolean`
* **Behaviors:**
  * `isExpired(): boolean` — Checks if current date exceeds expiry date.

#### GuestPreferences
* **Inherits From:** `ValueObject`
* **Attributes:**
  * `dietaryRestrictions: List<string>` (e.g., Vegan, Gluten-Free, Halal, Nut Allergy).
  * `pillowType: string` (e.g., Memory Foam, Feather, Hypoallergenic).
  * `preferredFloor: string` (e.g., Ground Floor, High Floor, Penthouse).
  * `specialRequests: string` (e.g., Quiet room away from elevator).
  * `marketingOptIn: boolean`

---

## 3. Entities & Aggregate Roots

### 3.1 Guest (Aggregate Root)
* **Classification:** Aggregate Root
* **Inherits From:** `AggregateRoot<GuestId>`
* **Responsibilities:** Manages guest profile, contact data, KYC identity documents, stay preferences, stay count, and status flags.
* **Attributes / Properties:**
  * `id: GuestId` — Primary identifier.
  * `firstName: string` — Given name.
  * `lastName: string` — Family name.
  * `email: Email` — Normalized communication email.
  * `phone: PhoneNumber` — Mobile telephone contact.
  * `vipStatus: GuestVipStatus` — VIP level or blacklist flag.
  * `identification: IdentificationDocument | null` — Verified government document.
  * `preferences: GuestPreferences` — Room, dining, and stay preferences.
  * `loyaltyAccountId: string | null` — Foreign reference to loyalty aggregate.
  * `totalCompletedStays: integer` — Cumulative completed reservation stays.
  * `createdAt: DateTime` — Profile registration timestamp.
  * `updatedAt: DateTime` — Last profile change timestamp.
* **Behaviors / Methods:**
  * `setIdentification(doc: IdentificationDocument, actor: string): Result` — Associates verified government ID.
  * `updatePreferences(preferences: GuestPreferences, actor: string): void` — Saves updated preferences.
  * `linkLoyaltyAccount(loyaltyAccountId: string, actor: string): void`
  * `recordCompletedStay(actor: string): void` — Increments stay count; triggers VIP promotion when threshold reached.
  * `blacklist(reason: string, actor: string): void` — Sets `BLACK_LISTED` flag.
  * `removeBlacklist(actor: string): void` — Restores standard status.
* **Domain Events Raised:**
  * `GuestRegisteredEvent`
  * `GuestVipStatusPromotedEvent`
  * `GuestBlacklistedEvent`

---

### 3.2 LoyaltyAccount (Aggregate Root)
* **Classification:** Aggregate Root
* **Inherits From:** `AggregateRoot<string>`
* **Responsibilities:** Governs loyalty points ledger, accruals from stays, redemptions, and automatic tier upgrades.
* **Attributes / Properties:**
  * `id: string` — Loyalty membership account number.
  * `guestId: GuestId` — Foreign reference to guest.
  * `pointsBalance: integer` — Currently available spendable points.
  * `lifetimePointsEarned: integer` — Cumulative historical points accrued (used for tier qualification).
  * `tier: LoyaltyTier` — Active tier level (Bronze, Silver, Gold, Platinum).
  * `transactions: List<LoyaltyTransaction>` — Historical ledger of points movements.
* **Behaviors / Methods:**
  * `accruePoints(points: integer, reason: string, referenceId: string | null, actor: string): Result` — Adds points, appends ledger entry, and evaluates tier upgrade.
  * `redeemPoints(points: integer, rewardDesc: string, actor: string): Result` — Deducts points after checking balance sufficiency.
  * `evaluateTierPromotion(): void` — Checks lifetime points against tier thresholds.
* **Domain Events Raised:**
  * `LoyaltyPointsAccruedEvent`
  * `LoyaltyPointsRedeemedEvent`
  * `LoyaltyTierPromotedEvent`

---

### 3.3 LoyaltyTransaction (Child Entity)
* **Classification:** Domain Entity (Child of `LoyaltyAccount`)
* **Inherits From:** `BaseEntity<string>`
* **Responsibilities:** Immutable single ledger record of points gained or spent.
* **Attributes / Properties:**
  * `id: string` — Transaction identifier.
  * `loyaltyAccountId: string` — Parent loyalty account.
  * `points: integer` — Number of points involved.
  * `type: 'ACCRUE' | 'REDEEM'` — Transaction direction.
  * `description: string` — Context (e.g., `"Stay #RES-9481 Accrual"`, `"Spa Voucher Redemption"`).
  * `referenceId: string | null` — External reservation or service order ID.
  * `timestamp: DateTime` — UTC transaction timestamp.

---

### 3.4 ServiceRequest (Aggregate Root)
* **Classification:** Aggregate Root
* **Inherits From:** `AggregateRoot<string>`
* **Responsibilities:** Governs in-stay on-demand service and concierge tasks requested by the guest.
* **Attributes / Properties:**
  * `id: string` — Service ticket identifier.
  * `guestId: GuestId` — Requesting guest.
  * `reservationId: string` — Active reservation identifier.
  * `roomNumber: string` — Room location requiring service.
  * `category: ServiceCategory` — Housekeeping, Concierge, Room Service, etc.
  * `description: string` — Exact guest instructions.
  * `priority: ServicePriority` — Urgency tier.
  * `status: ServiceStatus` — Lifecycle stage.
  * `assignedStaffId: string | null` — Staff member currently handling.
  * `fulfilledAt: DateTime | null` — Completion timestamp.
  * `cancellationReason: string | null`
* **Behaviors / Methods:**
  * `assignStaff(staffId: string, actor: string): Result` — Assigns to staff and changes status to `ASSIGNED`.
  * `markInProgress(actor: string): void` — Changes status to `IN_PROGRESS`.
  * `fulfill(actor: string): Result` — Marks request complete and records `fulfilledAt`.
  * `cancel(reason: string, actor: string): Result` — Cancels active request.
* **Domain Events Raised:**
  * `ServiceRequestCreatedEvent`
  * `ServiceRequestAssignedEvent`
  * `ServiceRequestFulfilledEvent`

---

### 3.5 GuestFeedback (Entity)
* **Classification:** Domain Entity
* **Inherits From:** `BaseEntity<string>`
* **Responsibilities:** Stores post-checkout or in-stay feedback, guest sentiment, and satisfaction scores.
* **Attributes / Properties:**
  * `id: string` — Feedback identifier.
  * `guestId: GuestId` — Reviewing guest.
  * `reservationId: string` — Evaluated stay reservation.
  * `overallRating: integer` — 1 to 5 stars.
  * `cleanlinessRating: integer` — 1 to 5 stars.
  * `staffRating: integer` — 1 to 5 stars.
  * `diningRating: integer` — 1 to 5 stars.
  * `comments: string` — Written feedback.
  * `isPublic: boolean` — Whether guest consented to public review showcase.
  * `submittedAt: DateTime` — Submission timestamp.

---

## 4. Domain Events

| Event Name | Aggregate Root | Trigger Condition | Payload Summary |
| :--- | :--- | :--- | :--- |
| `GuestRegisteredEvent` | `Guest` | When a new guest profile is established | `guestId`, `email`, `fullName`, `timestamp` |
| `LoyaltyTierPromotedEvent` | `LoyaltyAccount`| When points cross tier threshold | `loyaltyAccountId`, `guestId`, `oldTier`, `newTier` |
| `ServiceRequestCreatedEvent` | `ServiceRequest`| When guest submits room/concierge request | `requestId`, `guestId`, `roomNumber`, `category` |
| `ServiceRequestFulfilledEvent`| `ServiceRequest`| When staff marks request completed | `requestId`, `guestId`, `roomNumber`, `fulfilledAt` |
| `GuestFeedbackReceivedEvent` | `Guest` | When stay rating is submitted | `feedbackId`, `guestId`, `reservationId`, `overallRating` |

---

## 5. Repositories & Module Contracts (Public Facade)

### 5.1 Repository Interfaces
* **IGuestRepository:**
  * `findById(id: GuestId): Promise<Guest | null>`
  * `findByEmail(email: string): Promise<Guest | null>`
  * `findByPhone(phone: string): Promise<Guest | null>`
  * `searchByName(query: string): Promise<List<Guest>>`
  * `save(guest: Guest): Promise<void>`
* **ILoyaltyAccountRepository:**
  * `findById(id: string): Promise<LoyaltyAccount | null>`
  * `findByGuestId(guestId: string): Promise<LoyaltyAccount | null>`
  * `save(loyaltyAccount: LoyaltyAccount): Promise<void>`
* **IServiceRequestRepository:**
  * `findById(id: string): Promise<ServiceRequest | null>`
  * `findActiveByRoom(roomNumber: string): Promise<List<ServiceRequest>>`
  * `findByGuestId(guestId: string): Promise<List<ServiceRequest>>`
  * `save(request: ServiceRequest): Promise<void>`

### 5.2 IGuestModuleApi (Public Module Facade)
*Other modules (such as Reservations and Billing) interact with Guest context via this facade:*
* `getGuestSummary(guestId: string): Promise<GuestSummaryDto | null>`
* `isGuestEligibleForCheckIn(guestId: string): Promise<GuestStayEligibilityDto>`
* `awardLoyaltyPointsForStay(guestId: string, amountSpent: number, reservationId: string): Promise<void>`
