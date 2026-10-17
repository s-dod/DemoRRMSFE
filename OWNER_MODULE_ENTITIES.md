# Owner Module: Entities & Classes Specification

> **Module:** Owner (Bounded Context)  
> **Architecture:** Modular Monolithic  
> **Format:** Class & Entity Specification (No code implementation)

---

## 1. Owner Module Folder Structure

```text
src/modules/owner/
├── contracts/                        # Public API exposed to other modules
│   ├── owner-module-api.interface   # Synchronous facade methods
│   └── dtos/
│       ├── property-policy-summary.dto
│       └── owner-summary.dto
├── domain/                           # Pure Domain Core
│   ├── enums/
│   │   ├── ownership-type.enum
│   │   ├── owner-status.enum
│   │   └── property-operational-status.enum
│   ├── value-objects/
│   │   ├── owner-id.vo
│   │   ├── property-id.vo
│   │   ├── tax-info.vo
│   │   └── operating-hours.vo
│   ├── entities/
│   │   ├── owner.aggregate          # Aggregate Root
│   │   ├── resort-property.aggregate# Aggregate Root
│   │   ├── property-policy.entity   # Policy & Rules Entity
│   │   ├── department.entity        # Department Organization Entity
│   │   ├── revenue-target.entity    # Financial Target Entity
│   │   └── executive-audit-log.entity
│   ├── events/
│   │   ├── owner-registered.event
│   │   ├── property-onboarded.event
│   │   └── policy-updated.event
│   └── repositories/
│       ├── owner-repository.interface
│       └── property-repository.interface
├── application/                      # Use Cases & Handlers
│   ├── commands/
│   ├── queries/
│   └── event-handlers/
└── infrastructure/                   # Persistence & Facade
    ├── persistence/
    └── facade/
        └── owner-module.facade
```

---

## 2. Enums & Value Objects

### 2.1 Enums

#### OwnershipType
* `INDIVIDUAL` — Sole proprietorship.
* `CORPORATE` — Incorporated enterprise or holding group.
* `PARTNERSHIP` — Multi-owner partnership.
* `JOINT_VENTURE` — Shared venture arrangement.

#### OwnerStatus
* `ACTIVE` — In good standing; full access to portfolio.
* `SUSPENDED` — Temporarily barred due to compliance or audit issues.
* `PENDING_VERIFICATION` — Awaiting KYC or tax verification.

#### PropertyOperationalStatus
* `OPERATIONAL` — Fully open and servicing guests.
* `MAINTENANCE_SHUTDOWN` — Property closed for renovation.
* `SEASONAL_CLOSURE` — Off-season operational pause.

---

### 2.2 Value Objects

#### OwnerId
* **Inherits From:** `ValueObject`
* **Attributes:**
  * `value: UUID / string`
* **Purpose:** Strongly typed identifier for property owners.

#### PropertyId
* **Inherits From:** `ValueObject`
* **Attributes:**
  * `value: UUID / string`
* **Purpose:** Strongly typed identifier for individual resort properties.

#### TaxInfo
* **Inherits From:** `ValueObject`
* **Attributes:**
  * `taxNumber: string` — Government tax identification number (EIN, GSTIN, VAT).
  * `registrationCountry: string` — 2-letter ISO country code.
  * `isTaxExempt: boolean` — Exemption flag.

#### OperatingHours
* **Inherits From:** `ValueObject`
* **Attributes:**
  * `openingTime: string` (e.g., `"06:00"`)
  * `closingTime: string` (e.g., `"23:00"`)
  * `is24Hours: boolean`

---

## 3. Entities & Aggregate Roots

### 3.1 Owner (Aggregate Root)
* **Classification:** Aggregate Root
* **Inherits From:** `AggregateRoot<OwnerId>`
* **Responsibilities:** Manages owner profile, legal identity, portfolio of registered properties, and compliance state.
* **Attributes / Properties:**
  * `id: OwnerId` — Primary identifier.
  * `fullName: string` — Legal or representative name.
  * `email: Email` — Primary communication contact.
  * `phone: PhoneNumber` — Verified contact number.
  * `ownershipType: OwnershipType` — Structure of business entity.
  * `taxInfo: TaxInfo` — Legal tax registration details.
  * `status: OwnerStatus` — Current account standing.
  * `registeredPropertyIds: List<PropertyId>` — Collection of resort properties under ownership.
  * `createdAt: DateTime` — Registration timestamp.
  * `updatedAt: DateTime` — Last profile change timestamp.
* **Behaviors / Methods:**
  * `linkProperty(propertyId: PropertyId, actor: string): Result` — Links newly onboarded property to owner.
  * `unlinkProperty(propertyId: PropertyId, actor: string): Result` — Detaches transferred or sold property.
  * `suspend(reason: string, actor: string): void` — Suspends owner and disables management actions.
  * `activate(actor: string): void` — Restores active standing.
  * `updateContactDetails(fullName: string, phone: PhoneNumber, actor: string): void`
* **Domain Events Raised:**
  * `OwnerRegisteredEvent`
  * `OwnerStatusChangedEvent`

---

### 3.2 ResortProperty (Aggregate Root)
* **Classification:** Aggregate Root
* **Inherits From:** `AggregateRoot<PropertyId>`
* **Responsibilities:** Governs an individual resort location, its operating policies, departments, and financial targets.
* **Attributes / Properties:**
  * `id: PropertyId` — Primary identifier.
  * `ownerId: OwnerId` — Foreign identifier referencing owning entity.
  * `name: string` — Commercial resort name (e.g., `"Palm Grove Luxury Resort"`).
  * `code: string` — Unique resort code (e.g., `"RRMS-MUM-01"`).
  * `address: Address` — Physical location of the resort.
  * `status: PropertyOperationalStatus` — Operational condition.
  * `defaultCurrency: string` — 3-letter currency code for billing and targets.
  * `policy: PropertyPolicy` — Stay rules, check-in/out schedules, and fees.
  * `departments: List<Department>` — Operational departments within property.
  * `revenueTargets: List<RevenueTarget>` — Quarterly performance goals.
* **Behaviors / Methods:**
  * `updatePolicy(newPolicy: PropertyPolicy, actor: string): void` — Updates stay/check-in rules.
  * `addDepartment(dept: Department, actor: string): Result` — Creates operational unit (Housekeeping, F&B, etc.).
  * `setDepartmentHead(departmentId: string, staffId: string, actor: string): Result`
  * `assignRevenueTarget(target: RevenueTarget, actor: string): void`
  * `changeOperationalStatus(newStatus: PropertyOperationalStatus, actor: string): void`
* **Domain Events Raised:**
  * `PropertyOnboardedEvent`
  * `PropertyPolicyUpdatedEvent`
  * `PropertyStatusChangedEvent`

---

### 3.3 PropertyPolicy (Child Entity)
* **Classification:** Domain Entity (Child of `ResortProperty`)
* **Inherits From:** `BaseEntity<string>`
* **Responsibilities:** Enforces property rules and guest stay parameters.
* **Attributes / Properties:**
  * `id: string` — Unique policy identifier.
  * `checkInTime: string` — Standard arrival time (e.g., `"14:00"`).
  * `checkOutTime: string` — Standard departure time (e.g., `"11:00"`).
  * `cancellationGraceHours: integer` — Free cancellation window before check-in.
  * `lateCheckOutFeePerHour: decimal` — Surcharge rate for unapproved late departures.
  * `petPolicyAllowed: boolean` — Whether pets are permitted on premises.
  * `quietHoursStart: string` — Evening quiet period initiation (e.g., `"22:00"`).
  * `quietHoursEnd: string` — Morning quiet period termination (e.g., `"07:00"`).

---

### 3.4 Department (Child Entity)
* **Classification:** Domain Entity (Child of `ResortProperty`)
* **Inherits From:** `BaseEntity<string>`
* **Responsibilities:** Represents an operational unit (Front Desk, Housekeeping, Dining, Spa, Maintenance).
* **Attributes / Properties:**
  * `id: string` — Department identifier.
  * `propertyId: PropertyId` — Parent resort identifier.
  * `name: string` — Department title.
  * `headStaffId: string | null` — Designated supervisor / department manager.
  * `annualBudget: Money` — Allocated departmental expenditure limit.
  * `isActive: boolean` — Department operational toggle.

---

### 3.5 RevenueTarget (Child Entity)
* **Classification:** Domain Entity (Child of `ResortProperty`)
* **Inherits From:** `BaseEntity<string>`
* **Responsibilities:** Sets and tracks quarterly financial revenue expectations.
* **Attributes / Properties:**
  * `id: string` — Target identifier.
  * `propertyId: PropertyId` — Parent resort identifier.
  * `fiscalYear: integer` — e.g., `2026`.
  * `quarter: 1 | 2 | 3 | 4` — Financial quarter.
  * `targetAmount: Money` — Projected revenue goal.
  * `achievedAmount: Money` — Actual revenue recognized to date.

---

### 3.6 ExecutiveAuditLog (Entity)
* **Classification:** Domain Entity
* **Inherits From:** `BaseEntity<string>`
* **Responsibilities:** Immutable record of owner-level governance actions, config changes, and overrides.
* **Attributes / Properties:**
  * `id: string` — Audit log identifier.
  * `ownerId: OwnerId` — Acting owner identity.
  * `propertyId: PropertyId | null` — Impacted property, if applicable.
  * `action: string` — Action name (e.g., `"POLICY_UPDATED"`, `"DEPARTMENT_HEAD_ASSIGNED"`).
  * `targetEntity: string` — Affected resource type.
  * `changePayload: string / JSON` — Diff of old values vs new values.
  * `ipAddress: string` — Network origin of the executive action.
  * `timestamp: DateTime` — UTC timestamp of event.

---

## 4. Domain Events

| Event Name | Aggregate Root | Trigger Condition | Payload Summary |
| :--- | :--- | :--- | :--- |
| `OwnerRegisteredEvent` | `Owner` | When a new property owner account is verified | `ownerId`, `email`, `fullName`, `timestamp` |
| `PropertyOnboardedEvent` | `ResortProperty` | When a new resort property is added to portfolio | `propertyId`, `ownerId`, `code`, `name` |
| `PropertyPolicyUpdatedEvent`| `ResortProperty` | When check-in/out or fee policies are modified | `propertyId`, `updatedBy`, `timestamp` |
| `DepartmentHeadAssignedEvent`| `ResortProperty`| When a department manager is reassigned | `propertyId`, `departmentId`, `staffId` |

---

## 5. Repositories & Module Contracts (Public Facade)

### 5.1 Repository Interfaces
* **IOwnerRepository:**
  * `findById(id: OwnerId): Promise<Owner | null>`
  * `findByEmail(email: string): Promise<Owner | null>`
  * `save(owner: Owner): Promise<void>`
* **IResortPropertyRepository:**
  * `findById(id: PropertyId): Promise<ResortProperty | null>`
  * `findByCode(code: string): Promise<ResortProperty | null>`
  * `findByOwnerId(ownerId: OwnerId): Promise<List<ResortProperty>>`
  * `save(property: ResortProperty): Promise<void>`

### 5.2 IOwnerModuleApi (Public Module Facade)
*Other modules interact with the Owner bounded context only via this facade:*
* `getPropertyPolicy(propertyId: string): Promise<PropertyPolicySummaryDto | null>`
* `isPropertyOperational(propertyId: string): Promise<boolean>`
* `getOwnerSummary(ownerId: string): Promise<OwnerSummaryDto | null>`
