# Super Admin Module: Comprehensive Entity Matching & Technical Study Guide

> **Module:** Super Admin (Platform Governance & Multi-Tenant Core)  
> **Backend Architecture:** Spring Boot 3+, Hibernate/JPA, PostgreSQL / H2 (`super_admin` & `public` schemas)  
> **Frontend Architecture:** React 18, TypeScript, Tailwind CSS, CQRS/In-Memory LocalStorage Store  
> **Target Files:**
> - Backend: [`rmsBE-main/src/main/java/com/example/rrms/superadmin/entity/*`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/java/com/example/rrms/superadmin/entity) and [`rmsBE-main/src/main/java/com/example/rrms/authsecurity/domain/modal/Tenant.java`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/java/com/example/rrms/authsecurity/domain/modal/Tenant.java)
> - Frontend: [`DemoRRMSFE/src/lib/domain.ts`](file:///c:/Users/USER/Desktop/Resort/SUPER%20ADMIN/DemoRRMSFE/src/lib/domain.ts) and [`DemoRRMSFE/SUPER_ADMIN_MODULE_ENTITIES.md`](file:///c:/Users/USER/Desktop/Resort/SUPER%20ADMIN/DemoRRMSFE/SUPER_ADMIN_MODULE_ENTITIES.md)

---

## 1. Architectural Overview & Context

In the Resort Management System (RRMS), the **Super Admin Module** operates at the root platform cluster level (`tenantId = null`). It governs resort tenants (shards), platform credentials, support escalations, telemetry, and system-wide security configurations.

The system has two representations that developers must understand:
1. **Backend Core (`rmsBE-main`)**: Implemented in Java using JPA entities, divided between:
   - `com.example.rrms.superadmin.entity.*`: Platform tickets, config, audit logs, admin users, telemetry.
   - `com.example.rrms.authsecurity.domain.modal.*`: Multi-tenant shards (`Tenant`), general accounts (`User`), tenant audit logs.
2. **Frontend Client (`DemoRRMSFE`)**: Implemented in TypeScript:
   - Active runtime types in [`src/lib/domain.ts`](file:///c:/Users/USER/Desktop/Resort/SUPER%20ADMIN/DemoRRMSFE/src/lib/domain.ts).
   - Domain specification in [`SUPER_ADMIN_MODULE_ENTITIES.md`](file:///c:/Users/USER/Desktop/Resort/SUPER%20ADMIN/DemoRRMSFE/SUPER_ADMIN_MODULE_ENTITIES.md).
   - User interface in [`src/pages/SuperAdminDashboard.tsx`](file:///c:/Users/USER/Desktop/Resort/SUPER%20ADMIN/DemoRRMSFE/src/pages/SuperAdminDashboard.tsx).

---

## 2. High-Level Entity Matrix & Scorecard

Below is the summary of all **9 Super Admin Entities**, comparing backend availability, frontend definition, and field alignment:

| # | Entity Name | Backend Java Entity | Frontend TS Interface / Spec | Total Fields | Exact Match | Name / Type Mismatch | Missing in BE / FE | Compatibility Assessment |
|---|---|---|---|:---:|:---:|:---:|:---:|---|
| 1 | **Tenant** | [`Tenant.java`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/java/com/example/rrms/authsecurity/domain/modal/Tenant.java) | [`Tenant`](file:///c:/Users/USER/Desktop/Resort/SUPER%20ADMIN/DemoRRMSFE/src/lib/domain.ts#L92-L104) | 11 | 4 | 2 | 5 | **Partial Match** — BE entity lacks `tier`, `location`, `roomsCount` (present in DTO & FE). Enum case differs. |
| 2 | **SuperAdminUser** | [`SuperAdminUser.java`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/java/com/example/rrms/superadmin/entity/SuperAdminUser.java) | [`Account`](file:///c:/Users/USER/Desktop/Resort/SUPER%20ADMIN/DemoRRMSFE/src/lib/domain.ts#L78-L90) / Spec Class | 10 | 4 | 1 | 5 | **Spec Match / UI Generic** — BE has dedicated entity; FE UI uses generic `Account` (`module: 'SuperAdmin'`). Spec matches 100%. |
| 3 | **PlatformTicket** | [`PlatformTicket.java`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/java/com/example/rrms/superadmin/entity/PlatformTicket.java) | [`PlatformTicket`](file:///c:/Users/USER/Desktop/Resort/SUPER%20ADMIN/DemoRRMSFE/src/lib/domain.ts#L133-L154) | 18 | 16 | 0 | 2 | **Strong Match** — Highly aligned; only `assigneeEmail` is FE-only. Full cascade relations match. |
| 4 | **TicketReply** | [`TicketReply.java`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/java/com/example/rrms/superadmin/entity/TicketReply.java) | [`TicketReply`](file:///c:/Users/USER/Desktop/Resort/SUPER%20ADMIN/DemoRRMSFE/src/lib/domain.ts#L114-L122) | 7 | 5 | 1 | 1 | **Name Mismatch** — BE `createdAt` vs FE `timestamp`. FE embeds reply attachments directly. |
| 5 | **TicketAttachment** | [`TicketAttachment.java`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/java/com/example/rrms/superadmin/entity/TicketAttachment.java) | [`TicketAttachment`](file:///c:/Users/USER/Desktop/Resort/SUPER%20ADMIN/DemoRRMSFE/src/lib/domain.ts#L106-L112) | 7 | 1 | 4 | 2 | **Name / Storage Mismatch** — BE `fileName`/`mimeType`/`sizeBytes`/`storageKey` vs FE `name`/`type`/`size`/`dataUrl`. |
| 6 | **TicketHistoryEntry** | [`TicketHistoryEntry.java`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/java/com/example/rrms/superadmin/entity/TicketHistoryEntry.java) | [`TicketHistoryEntry`](file:///c:/Users/USER/Desktop/Resort/SUPER%20ADMIN/DemoRRMSFE/src/lib/domain.ts#L124-L131) | 6 | 4 | 1 | 1 | **Name Mismatch** — BE `createdAt` vs FE `timestamp`. Audit payload fields match identically. |
| 7 | **PlatformConfig** | [`PlatformConfig.java`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/java/com/example/rrms/superadmin/entity/PlatformConfig.java) | [`PlatformConfig`](file:///c:/Users/USER/Desktop/Resort/SUPER%20ADMIN/DemoRRMSFE/src/lib/domain.ts#L156-L166) | 10 | 9 | 0 | 1 | **Exact Match** — All platform settings (`maintenanceMode`, `registrationOpen`, `maxTenants`, timeouts) align 1:1. |
| 8 | **PlatformAuditLog** | [`PlatformAuditLog.java`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/java/com/example/rrms/superadmin/entity/PlatformAuditLog.java) | [`PlatformAuditLog`](file:///c:/Users/USER/Desktop/Resort/SUPER%20ADMIN/DemoRRMSFE/src/lib/domain.ts#L168-L176) | 8 | 5 | 1 | 2 | **Name & Scope Mismatch** — BE `createdAt` vs FE `timestamp`. BE records `ipAddress`. |
| 9 | **SystemTelemetrySnapshot**| [`SystemTelemetrySnapshot.java`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/java/com/example/rrms/superadmin/entity/SystemTelemetrySnapshot.java) | Dashboard State / Spec | 8 | 7 | 1 | 0 | **Type Definition Gap** — BE entity and FE Spec match; FE runtime lacks an explicit interface in `domain.ts`. |

---

## 3. Deep Dive: Field-by-Field Analysis for Each Entity

### 3.1 Entity 1: `Tenant` (Resort Multi-Tenant Shard)

The `Tenant` entity represents an isolated resort tenant instance within the cluster.

* **Backend Class:** `com.example.rrms.authsecurity.domain.modal.Tenant` (Table: `tenants`, schema: `public`)
* **Frontend Model:** `Tenant` interface in `src/lib/domain.ts` & `Tenant` aggregate in `SUPER_ADMIN_MODULE_ENTITIES.md`

#### Field Comparison Table:

| Field Name | Backend (Java) | Frontend (TypeScript) | Status | Analysis & Study Notes |
|---|---|---|:---:|---|
| **ID** | `UUID id` | `id: string` | **MATCH** | Primary key. UUID represented as hyphenated 36-char string in JSON. |
| **Code** | `String code` | `code: string` | **MATCH** | Unique uppercase identifier (e.g. `PALM`, `OCEAN`). |
| **Name** | `String name` | `name: string` | **MATCH** | Legal resort trade name (e.g. `The Palm Luxury Resort`). |
| **Status** | `TenantStatus status` (`ACTIVE`, `SUSPENDED`, `PENDING`, `ARCHIVED`) | `status: 'Active' \| 'Suspended' \| 'Pending'` | **TRANSFORMATION REQUIRED** | **Casing discrepancy:** Backend enum is all-caps (`ACTIVE`), frontend is Title Case (`'Active'`). Jackson requires a case-insensitive deserializer or string converter. |
| **Created At** | `Instant createdAt` | `createdAt: string` | **MATCH** | Stored as UTC timestamp in Postgres; serialized to ISO-8601 string (`2026-10-15T10:00:00Z`). |
| **Created By** | `User createdBy` (`UUID createdById`) | *(Not in `Tenant` interface)* | **MISSING IN FE** | Database foreign key to creator user. Exposed in backend DTOs when needed, but omitted in frontend table rows. |
| **Subscription Tier** | *(Not in BE `Tenant.java`)* | `tier?: string` | **MISSING IN BE ENTITY** | Present in `CreateTenantRequest` and FE UI (`'ENTERPRISE'`, `'STARTER'`), but the JPA entity has no column for it. |
| **Physical Location** | *(Not in BE `Tenant.java`)* | `location?: string` | **MISSING IN BE ENTITY** | Stored in FE state (`"Candolim, Goa · India"`); BE entity lacks `location` column. |
| **Rooms Count** | *(Not in BE `Tenant.java`)* | `roomsCount?: number` | **MISSING IN BE ENTITY** | Stored in FE state (`24`); BE entity lacks `roomsCount` column. |
| **Owner Information** | *(In BE `users` table via `Role.OWNER`)* | `ownerId?`, `ownerName?`, `ownerEmail?` | **TRANSFORMATION REQUIRED** | **Relational vs Denormalized:** Backend links tenant to owner through `User` repository query; frontend stores denormalized owner info directly on the `Tenant` record. |

---

### 3.2 Entity 2: `SuperAdminUser` (Platform Administrator)

Represents platform staff operating with root system privileges (`tenantId = null`).

* **Backend Class:** `com.example.rrms.superadmin.entity.SuperAdminUser` (Table: `super_admin.super_admin_users`)
* **Frontend Model:** Generic `Account` in `src/lib/domain.ts` vs Spec Class `SuperAdminUser` in `SUPER_ADMIN_MODULE_ENTITIES.md`

#### Field Comparison Table:

| Field Name | Backend (Java) | Frontend (TypeScript) | Status | Analysis & Study Notes |
|---|---|---|:---:|---|
| **ID** | `UUID id` | `id: string` | **MATCH** | Root user identifier. |
| **Name** | `String name` | `name: string` | **MATCH** | Admin full name. |
| **Email** | `String email` | `email: string` | **MATCH** | Unique login email. |
| **Password** | `String passwordHash` | `password: string` | **NAME MISMATCH** | Backend stores secure BCrypt hash; frontend client state holds demo string password. |
| **Role** | `SuperAdminRole role` (`SUPER_ADMIN`, `SUPPORT_LEAD`, `SECURITY_AUDITOR`, `READ_ONLY_VIEWER`) | `role: Role` (`'SUPER_ADMIN'`) | **MATCH** | Backend provides granular governance sub-roles; frontend recognizes `'SUPER_ADMIN'`. |
| **Active Flag** | `boolean active = true` | `active: boolean` | **MATCH** | Account activation flag. |
| **MFA Required** | `boolean mfaRequired = false` | *(In `PlatformConfig`)* | **MISSING IN FE ACCOUNT** | In backend, MFA can be toggled per user or globally. Frontend tracks MFA in global `PlatformConfig`. |
| **MFA Secret** | `String mfaSecret` | *(Excluded)* | **NOT APPLICABLE** | High-security TOTP seed. Never exposed to frontend JSON. |
| **Last Login** | `Instant lastLoginAt` | *(Not in `Account`)* | **MISSING IN FE** | Tracked on backend entity via `recordLogin()`. |
| **Audit Timestamps** | `Instant createdAt`, `updatedAt` | *(Not in `Account`)* | **MISSING IN FE** | Inherited from `AuditableEntity` in Java. |

---

### 3.3 Entity 3: `PlatformTicket` (Technical Support Escalation)

The escalation aggregate root used by resort owners and super admins to log and resolve platform incidents.

* **Backend Class:** `com.example.rrms.superadmin.entity.PlatformTicket` (Table: `super_admin.platform_tickets`)
* **Frontend Model:** `PlatformTicket` interface in `src/lib/domain.ts`

#### Field Comparison Table:

| Field Name | Backend (Java) | Frontend (TypeScript) | Status | Analysis & Study Notes |
|---|---|---|:---:|---|
| **ID** | `UUID id` | `id: string` | **MATCH** | Primary key. |
| **Tenant Code** | `String tenantCode` | `tenantCode: string` | **MATCH** | Shard routing identifier. |
| **Resort Name** | `String resortName` | `resortName: string` | **MATCH** | Denormalized resort name for quick list rendering. |
| **Owner Name** | `String ownerName` | `ownerName: string` | **MATCH** | Denormalized ticket initiator name. |
| **Owner Email** | `String ownerEmail` | `ownerEmail: string` | **MATCH** | Denormalized contact email. |
| **Creator ID** | `UUID creatorId` | `creatorId?: string` | **MATCH** | User who opened ticket. |
| **Assignee ID** | `UUID assigneeId` | `assigneeId?: string` | **MATCH** | Assigned super admin agent. |
| **Assignee Name** | `String assigneeName` | `assigneeName?: string` | **MATCH** | Assigned agent display name. |
| **Assignee Email** | *(Not in BE entity)* | `assigneeEmail?: string` | **MISSING IN BE** | Frontend interface has convenience field not present in DB. |
| **Title** | `String title` | `title: string` | **MATCH** | Subject line. Minimum length 5 characters. |
| **Category** | `TicketCategory category` | `category: string` | **MATCH** | Enum: `INFRASTRUCTURE`, `BILLING_DISPUTE`, `AUTHENTICATION_MFA`, `DATABASE_SHARDING`, `GENERAL_SUPPORT`. |
| **Priority** | `TicketPriority priority` | `priority: 'CRITICAL' \| 'HIGH' \| 'MEDIUM' \| 'LOW'` | **MATCH** | 100% identical values and casing. |
| **Status** | `TicketStatus status` | `status: 'OPEN' \| 'IN_PROGRESS' \| 'RESOLVED' \| 'CLOSED'` | **MATCH** | 100% identical values and casing. |
| **Description** | `String description` | `description: string` | **MATCH** | Incident diagnostic text. |
| **Resolution Notes**| `String resolutionNotes` | `resolutionNotes?: string` | **MATCH** | Notes added upon status reaching `RESOLVED`. |
| **Attachments** | `List<TicketAttachment>` | `attachments?: TicketAttachment[]`| **MATCH** | Cascade relationship (`CascadeType.ALL`, `orphanRemoval = true`). |
| **Replies** | `List<TicketReply>` | `replies?: TicketReply[]` | **MATCH** | Conversation thread child entities. |
| **History** | `List<TicketHistoryEntry>` | `history?: TicketHistoryEntry[]` | **MATCH** | Append-only event history entries. |
| **Timestamps** | `Instant createdAt`, `updatedAt` | `createdAt: string`, `updatedAt?: string` | **MATCH** | Serialized ISO timestamps. |

---

### 3.4 Entity 4: `TicketReply` (Ticket Thread Conversation)

* **Backend Class:** `com.example.rrms.superadmin.entity.TicketReply` (Table: `super_admin.ticket_replies`)
* **Frontend Model:** `TicketReply` interface in `src/lib/domain.ts`

#### Field Comparison Table:

| Field Name | Backend (Java) | Frontend (TypeScript) | Status | Analysis & Study Notes |
|---|---|---|:---:|---|
| **ID** | `UUID id` | `id: string` | **MATCH** | Reply identifier. |
| **Ticket Reference**| `PlatformTicket ticket` | *(Omitted)* | **NOT APPLICABLE** | Foreign key `@ManyToOne(ticket_id)`. Represented by array nesting in frontend JSON. |
| **Sender ID** | `UUID senderId` | `senderId: string` | **MATCH** | User who posted reply. |
| **Sender Name** | `String senderName` | `senderName: string` | **MATCH** | Display name of author. |
| **Sender Role** | `String senderRole` | `senderRole: string` | **MATCH** | E.g., `'SUPER_ADMIN'`, `'OWNER'`. |
| **Message** | `String message` | `message: string` | **MATCH** | Message text body. |
| **Timestamp** | `Instant createdAt` | `timestamp: string` | **NAME MISMATCH** | **BE uses `createdAt`; FE uses `timestamp`**. Serializer mapping required. |
| **Attachments** | *(Handled via `reply_id` on attachment)* | `attachments?: TicketAttachment[]` | **TRANSFORMATION REQUIRED** | In backend, attachment has foreign key `reply_id`. In frontend, reply directly nests attachment array. |

---

### 3.5 Entity 5: `TicketAttachment` (Diagnostic Media & Logs)

* **Backend Class:** `com.example.rrms.superadmin.entity.TicketAttachment` (Table: `super_admin.ticket_attachments`)
* **Frontend Model:** `TicketAttachment` interface in `src/lib/domain.ts`

#### Field Comparison Table:

| Field Name | Backend (Java) | Frontend (TypeScript) | Status | Analysis & Study Notes |
|---|---|---|:---:|---|
| **ID** | `UUID id` | `id: string` | **MATCH** | Attachment identifier. |
| **Ticket Reference**| `PlatformTicket ticket` | *(Omitted)* | **NOT APPLICABLE** | `@ManyToOne(ticket_id)`. |
| **Reply Reference** | `TicketReply reply` | *(Omitted)* | **NOT APPLICABLE** | `@ManyToOne(reply_id)`. |
| **File Name** | `String fileName` | `name: string` | **NAME MISMATCH** | **BE `fileName` vs FE `name`**. |
| **MIME / Content Type**| `String mimeType` | `type: string` | **NAME MISMATCH** | **BE `mimeType` vs FE `type`** (e.g. `'image/png'`). |
| **Byte Size** | `long sizeBytes` | `size: number` | **NAME MISMATCH** | **BE `sizeBytes` vs FE `size`**. |
| **File Storage** | `String storageKey` | `dataUrl: string` | **NAME & FORMAT MISMATCH**| **Architectural difference:** Backend stores cloud object key (`"s3://rrms-attachments/tickets/123/log.txt"`); frontend prototype stores base64 data URL. |
| **Timestamp** | `Instant createdAt` | *(Not in FE interface)* | **MISSING IN FE** | Present in backend database. |

---

### 3.6 Entity 6: `TicketHistoryEntry` (Immutable Audit Trail)

* **Backend Class:** `com.example.rrms.superadmin.entity.TicketHistoryEntry` (Table: `super_admin.ticket_history_entries`)
* **Frontend Model:** `TicketHistoryEntry` interface in `src/lib/domain.ts`

#### Field Comparison Table:

| Field Name | Backend (Java) | Frontend (TypeScript) | Status | Analysis & Study Notes |
|---|---|---|:---:|---|
| **ID** | `UUID id` | `id: string` | **MATCH** | Entry identifier. |
| **Ticket Reference**| `PlatformTicket ticket` | *(Omitted)* | **NOT APPLICABLE** | Embedded in JSON list. |
| **Actor Name** | `String actorName` | `actorName: string` | **MATCH** | User or `SYSTEM`. |
| **Actor Role** | `String actorRole` | `actorRole: string` | **MATCH** | E.g. `'SUPER_ADMIN'`, `'OWNER'`. |
| **Action** | `String action` | `action: string` | **MATCH** | Enum-like string (e.g. `'TICKET_CREATED'`, `'AGENT_ASSIGNED'`). |
| **Details** | `String details` | `details?: string` | **MATCH** | Descriptive note on changes. |
| **Timestamp** | `Instant createdAt` | `timestamp: string` | **NAME MISMATCH** | **BE uses `createdAt`; FE uses `timestamp`**. |

---

### 3.7 Entity 7: `PlatformConfig` (Cluster Singleton Configuration)

* **Backend Class:** `com.example.rrms.superadmin.entity.PlatformConfig` (Table: `super_admin.platform_configs`)
* **Frontend Model:** `PlatformConfig` interface in `src/lib/domain.ts`

#### Field Comparison Table:

| Field Name | Backend (Java) | Frontend (TypeScript) | Status | Analysis & Study Notes |
|---|---|---|:---:|---|
| **Singleton ID** | `String id = "GLOBAL_CONFIG"` | *(Implicit)* | **MATCH** | Cluster-wide constant singleton key. |
| **Maintenance Mode**| `boolean maintenanceMode` | `boolean maintenanceMode` | **MATCH** | Halts tenant logins when `true`. |
| **Registration Open**| `boolean registrationOpen` | `boolean registrationOpen` | **MATCH** | Allows new resort provisioning. |
| **Max Tenants** | `int maxTenants` | `maxTenants: number` | **MATCH** | Shard capacity cap (e.g. `50` or `500`). |
| **Session Timeout** | `int sessionTimeoutMinutes` | `sessionTimeoutMinutes: number` | **MATCH** | JWT / session inactivity limit. |
| **Telemetry Interval**| `int telemetryIntervalSeconds` | `telemetryIntervalSeconds: number` | **MATCH** | Node heartbeat polling frequency. |
| **Backup Schedule** | `String backupSchedule` | `backupSchedule: string` | **MATCH** | Cron expression (e.g. `'0 2 * * *'`). |
| **Enforce MFA** | `boolean enforceMfa` | `enforceMfa: boolean` | **MATCH** | Global multi-factor enforcement. |
| **Log Retention** | `int logRetentionDays` | `logRetentionDays: number` | **MATCH** | Audit trail purge policy. |
| **Timezone** | `String defaultTimezone` | `defaultTimezone: string` | **MATCH** | E.g. `'UTC'`. |
| **Audit Timestamps**| `Instant createdAt`, `updatedAt` | *(Not in FE interface)* | **MISSING IN FE** | Present via `AuditableEntity`. |

---

### 3.8 Entity 8: `PlatformAuditLog` (Security Audit Trail)

* **Backend Class:** `com.example.rrms.superadmin.entity.PlatformAuditLog` (Table: `super_admin.platform_audit_logs`)
* **Frontend Model:** `PlatformAuditLog` interface in `src/lib/domain.ts`

#### Field Comparison Table:

| Field Name | Backend (Java) | Frontend (TypeScript) | Status | Analysis & Study Notes |
|---|---|---|:---:|---|
| **ID** | `UUID id` | `id: string` | **MATCH** | Entry identifier. |
| **Actor** | `String actor` | `actor: string` | **MATCH** | User who executed action. |
| **Action** | `String action` | `action: string` | **MATCH** | Description code (e.g. `'UPDATE_PLATFORM_CONFIG'`). |
| **Details** | `String details` | `details: string` | **MATCH** | Payload or human-readable explanation. |
| **Severity** | `AuditSeverity severity` (`INFO`, `WARNING`, `CRITICAL`, `SECURITY_ALERT`) | `severity: 'INFO' \| 'WARNING' \| 'CRITICAL'` | **MATCH** | Backend has additional `SECURITY_ALERT`. Frontend union is compatible. |
| **Tenant Code** | `String tenantCode` | `tenantCode?: string` | **MATCH** | Nullable code if operation affected a specific tenant. |
| **IP Address** | `String ipAddress` | *(Missing in `domain.ts`)* | **MISSING IN FE CODE** | Present in backend DB & FE spec ([`SUPER_ADMIN_MODULE_ENTITIES.md:598`](file:///c:/Users/USER/Desktop/Resort/SUPER%20ADMIN/DemoRRMSFE/SUPER_ADMIN_MODULE_ENTITIES.md#L598)). |
| **Timestamp** | `Instant createdAt` | `timestamp: string` | **NAME MISMATCH** | **BE `createdAt` vs FE `timestamp`**. |

---

### 3.9 Entity 9: `SystemTelemetrySnapshot` (Cluster Telemetry)

* **Backend Class:** `com.example.rrms.superadmin.entity.SystemTelemetrySnapshot` (Table: `super_admin.system_telemetry_snapshots`)
* **Frontend Model:** Inline state in [`SuperAdminDashboard.tsx`](file:///c:/Users/USER/Desktop/Resort/SUPER%20ADMIN/DemoRRMSFE/src/pages/SuperAdminDashboard.tsx#L1369-L1475) & Class in [`SUPER_ADMIN_MODULE_ENTITIES.md`](file:///c:/Users/USER/Desktop/Resort/SUPER%20ADMIN/DemoRRMSFE/SUPER_ADMIN_MODULE_ENTITIES.md#L606-L619)

#### Field Comparison Table:

| Field Name | Backend (Java) | Frontend Spec & UI | Status | Analysis & Study Notes |
|---|---|---|:---:|---|
| **ID** | `UUID id` | `id: string` | **MATCH** | Primary key. |
| **Active Tenants** | `int activeTenants` | `activeTenants: number` | **MATCH** | Online shard counter. |
| **Total Rooms** | `int totalRoomsManaged` | `totalRoomsManaged: number` | **MATCH** | Aggregate room capacity across shards. |
| **CPU Usage** | `double cpuUsagePercent` | `cpuUsagePercent: number` | **MATCH** | Percentage metric. |
| **Memory Usage** | `double memoryUsagePercent` | `memoryUsagePercent: number` | **MATCH** | Percentage metric. |
| **Critical Tickets**| `int openCriticalTickets` | `openCriticalTickets: number` | **MATCH** | Counter of escalated incidents. |
| **Request Rate** | `int apiRequestsPerMinute` | `apiRequestsPerMinute: number` | **MATCH** | Platform throughput. |
| **Timestamp** | `Instant createdAt` | `timestamp: Date` | **NAME MISMATCH** | BE `createdAt` vs FE `timestamp`. |
| **Frontend Type** | Explicit Entity in Java | No exported TS interface in `src/lib/domain.ts` | **TYPE GAP** | **Action:** Export `export interface SystemTelemetrySnapshot` in `domain.ts`. |

---

## 4. Architectural Patterns & Reconciliation Study Guide

### 4.1 The Three Common Integration Gaps

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. NAMING CONVENTIONS                                                       │
│    Backend: createdAt  |  fileName  |  mimeType  |  sizeBytes  |  storageKey│
│    Frontend: timestamp |  name      |  type      |  size       |  dataUrl   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. ENUM CASING                                                              │
│    Backend:  TenantStatus.ACTIVE  (UPPERCASE SCREAMING_SNAKE)               │
│    Frontend: 'Active'             (Title Case String Union)                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. RELATIONAL NORMALIZATION VS DENORMALIZED UI STATE                        │
│    Backend:  Tenant references createdBy (User) | Owner looked up via query  │
│    Frontend: Tenant directly holds ownerName, ownerEmail, location, rooms   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Jackson DTO Serializer Solution

To bridge naming differences without modifying existing database schemas, configure Jackson mappings on the Spring Boot DTOs:

```java
public record TicketReplyResponse(
    UUID id,
    UUID senderId,
    String senderName,
    String senderRole,
    String message,
    @JsonProperty("timestamp") Instant createdAt,
    List<TicketAttachmentResponse> attachments
) {}
```

```java
public record TicketAttachmentResponse(
    UUID id,
    @JsonProperty("name") String fileName,
    @JsonProperty("type") String mimeType,
    @JsonProperty("size") long sizeBytes,
    @JsonProperty("dataUrl") String downloadUrl
) {}
```

### 4.3 Database Schema Recommendation for `Tenant.java`

Update [`com.example.rrms.authsecurity.domain.modal.Tenant`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/java/com/example/rrms/authsecurity/domain/modal/Tenant.java) to persist the missing metadata:

```java
@Column(length = 50)
private String tier = "STARTER";

@Column(length = 255)
private String location;

@Column(name = "rooms_count")
private Integer roomsCount = 0;
```

---

## 5. Study Review Checklist

- [x] **Did you verify Enum Casing?** (`TenantStatus` now supports Title-case `'Active'`, `'Suspended'`, `'Pending'`, `'Archived'` via `@JsonValue` & `@JsonCreator`).
- [x] **Are Timestamps mapped to frontend names?** (`createdAt` has `@JsonProperty("timestamp")` and alias getter `getTimestamp()`).
- [x] **Are Attachment fields aligned?** (`TicketAttachment` supports `name`, `type`, `size`, and `dataUrl`).
- [x] **Are Tenant capacity & tier fields persisted?** (`Tenant` entity and DTOs now include `tier`, `location`, `roomsCount`).
- [x] **Are Ticket Categories aligned with Frontend UI?** (`TicketCategory` includes `PAYMENTS`, `INTEGRATIONS`, `SECURITY`, `SYSTEM`).
- [x] **Are Backend Tests passing?** (All 12 backend integration and mapping tests pass cleanly with `BUILD SUCCESS`).

---

## 6. Summary of Applied Backend Updates (`rmsBE-main`)

1. **[`Tenant.java`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/java/com/example/rrms/authsecurity/domain/modal/Tenant.java)**:
   - Added `@Column private String tier`, `@Column private String location`, `@Column private Integer roomsCount`.
2. **[`TenantStatus.java`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/java/com/example/rrms/authsecurity/domain/enums/TenantStatus.java)**:
   - Added `PENDING("Pending")` and `ARCHIVED("Archived")`.
   - Added `@JsonValue` and `@JsonCreator` for case-tolerant Title-case serialization matching frontend union `'Active' | 'Suspended' | 'Pending'`.
3. **[`TenantResponse.java`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/java/com/example/rrms/authsecurity/dto/response/TenantResponse.java)** & **[`CreateTenantRequest.java`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/java/com/example/rrms/authsecurity/dto/request/CreateTenantRequest.java)**:
   - Added `tier`, `location`, `roomsCount` with backward-compatible constructors.
4. **[`UserProvisioningService.java`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/java/com/example/rrms/authsecurity/service/UserProvisioningService.java)**:
   - Set and return `tier`, `location`, and `roomsCount`.
5. **[`PlatformTicket.java`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/java/com/example/rrms/superadmin/entity/PlatformTicket.java)**:
   - Added `assigneeEmail`, overloaded `assignAgent(..., agentEmail, ...)`, and updated `addAttachment(...)` to support `dataUrl` and link to `TicketReply`.
6. **[`TicketAttachment.java`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/java/com/example/rrms/superadmin/entity/TicketAttachment.java)**:
   - Mapped `@JsonProperty("name")`, `@JsonProperty("type")`, `@JsonProperty("size")`, `@JsonProperty("dataUrl")`, `@JsonProperty("timestamp")`.
   - Provided alias getters `getName()`, `getType()`, `getSize()`, `getTimestamp()`.
7. **[`TicketReply.java`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/java/com/example/rrms/superadmin/entity/TicketReply.java)**:
   - Added `@JsonProperty("timestamp")`, alias getter `getTimestamp()`, and mapped `@OneToMany` collection of `attachments`.
8. **[`TicketHistoryEntry.java`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/java/com/example/rrms/superadmin/entity/TicketHistoryEntry.java)**, **[`PlatformAuditLog.java`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/java/com/example/rrms/superadmin/entity/PlatformAuditLog.java)**, & **[`SystemTelemetrySnapshot.java`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/java/com/example/rrms/superadmin/entity/SystemTelemetrySnapshot.java)**:
   - Added `@JsonProperty("timestamp")` and `getTimestamp()` aliases.
9. **[`TicketCategory.java`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/java/com/example/rrms/superadmin/enums/TicketCategory.java)**:
   - Added frontend dropdown categories: `PAYMENTS`, `INTEGRATIONS`, `SECURITY`, `SYSTEM`.
10. **[`V2__create_super_admin_tables.sql`](file:///C:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsBE-main/src/main/resources/db/migration/V2__create_super_admin_tables.sql)**:
   - Added `assignee_email` and `data_url` (with nullable `storage_key`).

