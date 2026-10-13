# RRMS — Resort & Restaurant Management System Flow Documentation

## 1. Project Overview

**Project Name:** RRMS (Resort & Restaurant Management System)
**Purpose:** An integrated portal for internal operations (Management, Staff, Owner) and Guest experiences for a luxury resort.
**Target Users:** 
- Guests (booking, checking in, requests, billing, loyalty)
- Management (oversight, reservations, billing, reports)
- Staff (housekeeping, maintenance, F&B, spa, reception)
- Owners (analytics, configuration, audit, permissions)
**Technology Stack:** React, TypeScript, Vite, React Router, Recharts, Framer Motion, Lucide Icons, Sonner (Toasts).
**High-Level Architecture:** Currently a client-side application with simulated local state (`lib/store.tsx` + `lib/domain.ts`).

```text
                         RRMS
                          │
          ┌───────────────┼───────────────┬───────────────┐
          │               │               │               │
        GUEST         MANAGEMENT        STAFF           OWNER
          │               │               │               │
       Dashboard       Dashboard       Dashboard      Dashboard
       Reservations    Reservations    Reservations   Rooms
       Services        Rooms           Rooms          Billing
       Billing         Tasks           Tasks          Reports
       Profile         Services        Services       Accounts
       Support         Billing         Billing        Permissions
       Loyalty         Guests          Guests         Audit
       Reviews         Team            Team           Settings
                       Support         Support
                       Reports         Reports
                       Settings        Settings
                       Promotions      Promotions
```

## 2. Role & Module Structure

The application supports four primary modules.

| Role | Module | View | Create | Update | Delete | Approve |
| ---- | ------ | ---- | ------ | ------ | ------ | ------- |
| Guest | Guest | Self Data | Requests | Profile | TBD | N/A |
| Management | Management | All | Most | Most | TBD | Requests |
| Staff | Staff | Assigned | Tasks | Status | No | No |
| Owner | Owner | All | Accounts | Config | Yes | Settings |

- **Guest:** Focused on personal stay experience, booking, ordering room service, and paying bills.
- **Management:** Full operational control over guests, rooms, team tasks, and general reporting.
- **Staff:** Role-based access (e.g. Housekeeping, Maintenance, Spa). They view and update task/service status.
- **Owner:** Executive dashboard, property settings, user management, audit logs.

## 3. Complete Navigation Structure

### Guest
```text
Guest
├── Dashboard (Overview, Bookings, Rewards, Actions)
├── My Bookings (Reservations)
├── Services (Experiences, Spa, Dining)
├── Billing (Folio, Payments)
├── Profile
├── Support (Concierge)
├── Loyalty (Palm Rewards)
└── Reviews
```

### Management
```text
Management
├── Dashboard
├── Reservations
├── Rooms
├── Amenities
├── Tasks
├── Services
├── Billing
├── Guests
├── Team
├── Support
├── Reports
├── Settings
└── Promotions
```

### Staff
```text
Staff
├── Dashboard (Role-specific tasks)
├── Reservations
├── Rooms
├── Tasks
├── Services
├── Billing
├── Guests
├── Team
├── Support
├── Reports
├── Settings
└── Promotions
```

### Owner
```text
Owner
├── Dashboard (Executive stats)
├── Amenities
├── Rooms
├── Billing
├── Reports
├── Accounts (User Management)
├── Permissions
├── Audit
└── Settings
```

## 4. Overall Application Flow

```text
Login Screen (Role Presets)
  ↓
Authentication (Local State validation)
  ↓
Role Detection & Route Redirect (/<module>/dashboard)
  ↓
Role Dashboard
  ↓
Sidebar Navigation (Select Page)
  ↓
Data View (Tables/Cards/Tabs)
  ↓
Action (Modal/Form)
  ↓
Local Store Update
  ↓
UI Refresh
```

## 5. Guest Module

### Guest Dashboard
**Route:** `/guest/dashboard`
**Purpose:** Overview of upcoming/active stays, quick actions for concierge and room service, loyalty points.
**Tabs/Flows:** Progress stepper for stay (Confirmed -> Checked In -> Completed).
**Buttons:** View Reservation, Order Room Service, Extra Towels, Chat with Concierge, Redeem Points, Pay Now.
**Statuses Represented:** Confirmed, Checked In, Scheduled.

### My Bookings
**Route:** `/guest/reservations`
**Purpose:** List of reservations associated with the guest.
**Tabs:** Upcoming, Active, Completed, Cancelled.
**Actions:** View Details, Export CSV.

### Guest Support
**Route:** `/guest/support`
**Purpose:** Communication with concierge and staff.

## 6. Management Module

### Management Dashboard
**Route:** `/management/dashboard`
**Purpose:** High-level overview of resort operations (Occupancy, Revenue, Arrivals, Pending tasks).
**Widgets:** Stats Grid, Revenue Chart, Rooms Pie Chart, Today's Arrivals Table, Attention Needed (Tasks/Requests).

### Room Management
**Route:** `/management/rooms`
**Tabs:** Overview, All rooms, Room types, Pricing, Availability, Maintenance.
**Actions:** Add room, View, Edit, Delete, Change status, Resolve issue, Add room type.
**Modals:** Room Form, Room Status Form, Resolve Issue.

### Reservations
**Route:** `/management/reservations`
**Tabs:** All, Arrivals, In house, Upcoming, Completed, Cancelled.
**Actions:** New reservation, Export CSV, Approve/Decline change request.
**Modals:** Reservation Wizard (5-step process).

## 7. Staff Module

### Staff Dashboard
**Route:** `/staff/dashboard`
**Purpose:** Filtered view showing tasks assigned to the current staff role (e.g. Housekeeping, Maintenance).
**Actions:** Change task status (Start work, Request inspection, Complete task), Accept/Complete service requests.

## 8. Owner Module

### Owner Dashboard
**Route:** `/owner/dashboard`
**Purpose:** Executive metrics, overall revenue, cancellation rates, management team tracking.

### Accounts & Permissions
**Route:** `/owner/accounts`, `/owner/permissions`
**Tabs:** Accounts, Roles
**Actions:** Create/Edit Manager and Staff accounts, Adjust permissions for roles.

## 9. Authentication Flow

```text
User opens /login
 ↓
Select Preset (or enter credentials)
 ↓
Submit Form
 ↓
Store Validates (store.login)
 ↓
Token/Session assigned (Local context)
 ↓
Redirect to /<module>/dashboard
```

## 10. Complete Forms Reference

- **Login Form**: Email, Password. Submit -> Login.
- **Room Form**: Number, Floor, Type, Capacity, Bed Type, Beds, Base Price, Description, Images, Amenities.
- **Room Status Form**: New Status, Transfer guest (if occupied), Notes.
- **Reservation Wizard**:
  - Step 1: Guest Selection/Details
  - Step 2: Dates (Check-In/Out), Adults, Source, Room Selection
  - Step 3: Offer/Discount, Notes
  - Step 4: Review
  - Step 5: Credentials generation
- **Task Form**: Title, Role, Room, Priority, Status, Kind.

## 11. Tables & Listing Pages

- **Reservations Table**: Guest, Room, Stay dates, Total, Status, Action.
- **Rooms Table**: Room (number/type), Sleeps (capacity), Nightly rate, Status, Actions.
- **Accounts Table**: Name/Email, Role/Shift, Module, Status, Actions.

## 12. Modal & Dialog Documentation

| Modal | Trigger | Purpose | Actions |
| ----- | ------- | ------- | ------- |
| Room Form | Add/Edit Room | Manage room data | Save, Cancel |
| Room Status | Change Status | Update room state (e.g. Cleaning) | Save |
| Resolve Issue | Resolve | Clear Maintenance/OOS state | Confirm |
| Reservation | New Booking | Walkthrough booking | Next, Confirm |
| Confirm Delete | Delete action | Warn before removal | Delete, Cancel |

## 13. Status & Workflow Documentation

**Room Statuses:** Ready, Occupied, Dirty, Inspection, Maintenance, Out of Service.
**Reservation Statuses:** Confirmed, Checked in, Completed, Cancelled, No-show.
**Task Statuses:** Pending, In progress, Inspection, Completed.
**Service Statuses:** Requested, Accepted, In progress, Completed, Cancelled.

## 14. Entity / Data Requirements

Frontend Types identified from `domain.ts`:
- **Room**: id, number, type, floor, rate, capacity, status, etc.
- **Account**: id, name, email, module, role, active, shift.
- **Reservation**: id, guestId, roomId, checkIn, checkOut, status, rate, etc.
- **Task**: id, title, role, roomId, assignee, priority, status.
- **Service**: id, reservationId, name, category, amount, status.

## 15. API Requirements

**Current Status:** Fully implemented in Frontend Local State (`store.tsx`).
**Backend Pending:** To transition this to a real backend, the following REST APIs are required:
- `POST /api/auth/login`
- `GET /api/rooms`, `POST /api/rooms`, `PUT /api/rooms/{id}`, `DELETE /api/rooms/{id}`
- `GET /api/reservations`, `POST /api/reservations`, `PUT /api/reservations/{id}/status`
- `GET /api/tasks`, `PUT /api/tasks/{id}/status`
- `GET /api/guests`, `GET /api/accounts`
- `GET /api/reports/dashboard`

## 16. Developer Implementation Notes

### Already Implemented
- Complete UI flow, routing, state management (via local mock store).
- Component library (Cards, Tables, Modals, Forms, Buttons, Icons).
- Role-based redirect and authorization guards (`App.tsx`).

### Backend Required
- Database schema mapping for `domain.ts` interfaces.
- Spring Boot Controllers matching the mock actions in `store.tsx`.
- Real authentication (JWT) replacing the local `login` function.

### TBD
- Payment Gateway integration (currently "outside application").
- Live email/SMS notifications (currently mocked as "Simulated").

---
**Summary Stats:**
- Roles found: 4 Modules (Guest, Management, Staff, Owner) + 7 Staff Roles
- Modules found: 14 main views
- Major Screens: Dashboard, Rooms, Reservations, Tasks, Billing, Accounts
- API Calls: 0 actual HTTP calls (100% local state `act()` dispatch pattern)
