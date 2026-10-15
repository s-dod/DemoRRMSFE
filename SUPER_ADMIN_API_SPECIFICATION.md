# RRMS — Super Admin Module REST API Specification

> **Platform Boundary Rule:** The Super Admin operates at the root platform cluster level (`tenantId: null`). Super Admin governs multi-tenant resort shards, platform owner identities, technical support escalations, system telemetry, and cluster security parameters, without directly modifying individual tenant stay records (such as guest rooms, bookings, or folio bills).

---

## 1. Global Standards & Headers

### Common Request Headers
| Header | Value | Description |
| :--- | :--- | :--- |
| `Authorization` | `Bearer <JWT_TOKEN>` | Required for all protected endpoints |
| `Content-Type` | `application/json` | Required for `POST`, `PUT`, `PATCH` |
| `Accept` | `application/json` | Standard response format |

### Standard Success Response Envelope (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {}
}
```

### Standard Error Response Envelope (`4xx` / `5xx`)
```json
{
  "success": false,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "error": {
    "code": "UNAUTHORIZED_ACCESS",
    "message": "Only Super Admin can execute platform governance operations.",
    "details": []
  }
}
```

---

## 2. Authentication & Session Management

### 2.1 Super Admin Login
- **Method:** `POST`
- **Path:** `/api/v1/auth/superadmin/login`
- **Access:** Public

#### Request Body
```json
{
  "email": "admin@rrms.demo",
  "password": "Admin@123"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "user": {
      "id": "superadmin",
      "name": "Platform Administrator",
      "email": "admin@rrms.demo",
      "module": "SuperAdmin",
      "role": "SUPER_ADMIN",
      "active": true,
      "tenantId": null,
      "mfaRequired": false
    }
  }
}
```

---

### 2.2 Verify MFA Code (When `enforceMfa: true`)
- **Method:** `POST`
- **Path:** `/api/v1/auth/superadmin/mfa/verify`
- **Access:** Authenticated (Pre-session Token)

#### Request Body
```json
{
  "mfaToken": "temp-pre-auth-token-xyz",
  "code": "489201"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "user": {
      "id": "superadmin",
      "name": "Platform Administrator",
      "email": "admin@rrms.demo",
      "role": "SUPER_ADMIN"
    }
  }
}
```

---

### 2.3 Get Current Super Admin Profile
- **Method:** `GET`
- **Path:** `/api/v1/auth/me`
- **Access:** Super Admin

#### Response (`200 OK`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "id": "superadmin",
    "name": "Platform Administrator",
    "email": "admin@rrms.demo",
    "module": "SuperAdmin",
    "role": "SUPER_ADMIN",
    "active": true,
    "tenantId": null
  }
}
```

---

### 2.4 Logout
- **Method:** `POST`
- **Path:** `/api/v1/auth/logout`
- **Access:** Super Admin

#### Response (`200 OK`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "message": "Super Admin session invalidated successfully."
  }
}
```

---

## 3. Platform Overview & Metrics

### 3.1 Get Platform Governance KPIs
- **Method:** `GET`
- **Path:** `/api/v1/superadmin/overview/stats`
- **Access:** Super Admin

#### Response (`200 OK`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "totalTenants": 8,
    "activeTenants": 7,
    "suspendedTenants": 1,
    "pendingTenants": 0,
    "totalOwners": 8,
    "activeOwners": 7,
    "openTickets": 4,
    "inProgressTickets": 2,
    "criticalTickets": 1,
    "clusterStatus": "HEALTHY",
    "activeNodes": 4,
    "maintenanceMode": false,
    "avgResponseTimeMs": 24
  }
}
```

---

### 3.2 Get Recent Platform Activity & Alerts
- **Method:** `GET`
- **Path:** `/api/v1/superadmin/overview/activity`
- **Access:** Super Admin

#### Response (`200 OK`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "recentTickets": [
      {
        "id": "TK-1023",
        "title": "guest of room 201 face some issue",
        "tenantCode": "PALM",
        "priority": "HIGH",
        "status": "OPEN",
        "createdAt": "2026-10-15T09:15:00.000Z"
      }
    ],
    "recentAuditLogs": [
      {
        "id": "PA-1792055000",
        "timestamp": "2026-10-15T09:15:00.000Z",
        "actor": "Vikram Oberoi",
        "action": "TICKET_SUBMITTED",
        "tenantCode": "PALM",
        "severity": "INFO",
        "details": "Opened incident ticket #TK-1023 [HIGH] for PALM"
      }
    ]
  }
}
```

---

## 4. Multi-Tenant Resort Management (Sharding)

### 4.1 List All Tenants
- **Method:** `GET`
- **Path:** `/api/v1/superadmin/tenants`
- **Query Parameters:**
  - `status`: `Active` | `Suspended` | `Pending` (optional)
  - `search`: Filter by name or code (optional)
  - `page`: Default `1`
  - `limit`: Default `20`
- **Access:** Super Admin

#### Response (`200 OK`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "tenants": [
      {
        "id": "tenant-palm",
        "code": "PALM",
        "name": "The Palm Luxury Resort & Spa",
        "status": "Active",
        "tier": "Enterprise",
        "location": "Candolim, Goa · India",
        "roomsCount": 30,
        "ownerId": "owner-palm-01",
        "ownerName": "Vikram Oberoi",
        "ownerEmail": "owner@rrms.demo",
        "createdAt": "2026-08-01T10:00:00.000Z"
      },
      {
        "id": "tenant-azure",
        "code": "AZUR",
        "name": "Azure Bay Cliff Villas",
        "status": "Active",
        "tier": "Boutique Luxury",
        "location": "Vagator, Goa · India",
        "roomsCount": 18,
        "ownerId": "owner-azur-01",
        "ownerName": "Aarav Singhania",
        "ownerEmail": "aarav.singhania@azurebay.demo",
        "createdAt": "2026-09-12T14:30:00.000Z"
      }
    ],
    "totalCount": 2,
    "page": 1,
    "limit": 20
  }
}
```

---

### 4.2 Get Tenant by ID or Code
- **Method:** `GET`
- **Path:** `/api/v1/superadmin/tenants/{tenantId}`
- **Access:** Super Admin

#### Response (`200 OK`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "id": "tenant-palm",
    "code": "PALM",
    "name": "The Palm Luxury Resort & Spa",
    "status": "Active",
    "tier": "Enterprise",
    "location": "Candolim, Goa · India",
    "roomsCount": 30,
    "ownerId": "owner-palm-01",
    "ownerName": "Vikram Oberoi",
    "ownerEmail": "owner@rrms.demo",
    "createdAt": "2026-08-01T10:00:00.000Z",
    "stats": {
      "activeStaff": 14,
      "activeGuests": 20,
      "occupancyRate": 67.5,
      "storageUsedMb": 240
    }
  }
}
```

---

### 4.3 Provision New Resort Tenant & Primary Owner
- **Method:** `POST`
- **Path:** `/api/v1/superadmin/tenants`
- **Access:** Super Admin

#### Request Body
```json
{
  "code": "HERI",
  "name": "The Heritage Palace Resort",
  "tier": "Enterprise",
  "location": "Udaipur, Rajasthan · India",
  "roomsCount": 42,
  "ownerName": "Maharaja Gajraj Singh",
  "ownerEmail": "gajraj.singh@heritagepalace.demo",
  "password": "Resort@123"
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "tenant": {
      "id": "tenant-heri",
      "code": "HERI",
      "name": "The Heritage Palace Resort",
      "status": "Active",
      "tier": "Enterprise",
      "location": "Udaipur, Rajasthan · India",
      "roomsCount": 42,
      "ownerId": "owner-heri-k9f2b1",
      "ownerName": "Maharaja Gajraj Singh",
      "ownerEmail": "gajraj.singh@heritagepalace.demo",
      "createdAt": "2026-10-15T12:00:00.000Z"
    },
    "ownerAccount": {
      "id": "owner-heri-k9f2b1",
      "name": "Maharaja Gajraj Singh",
      "email": "gajraj.singh@heritagepalace.demo",
      "role": "Owner",
      "module": "Owner",
      "tenantId": "HERI",
      "active": true
    },
    "credentials": {
      "resortName": "The Heritage Palace Resort",
      "tenantCode": "HERI",
      "loginEmail": "gajraj.singh@heritagepalace.demo",
      "temporaryPassword": "Resort@123"
    }
  }
}
```

---

### 4.4 Update Tenant Details
- **Method:** `PUT`
- **Path:** `/api/v1/superadmin/tenants/{tenantId}`
- **Access:** Super Admin

#### Request Body
```json
{
  "name": "The Palm Luxury Resort & Wellness Sanctuary",
  "status": "Active",
  "tier": "Enterprise Ultra",
  "location": "Candolim Beach Road, North Goa · India",
  "roomsCount": 36
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "id": "tenant-palm",
    "code": "PALM",
    "name": "The Palm Luxury Resort & Wellness Sanctuary",
    "status": "Active",
    "tier": "Enterprise Ultra",
    "location": "Candolim Beach Road, North Goa · India",
    "roomsCount": 36,
    "updatedAt": "2026-10-15T12:00:00.000Z"
  }
}
```

---

### 4.5 Update Tenant Shard Status (Suspend / Activate)
- **Method:** `PATCH`
- **Path:** `/api/v1/superadmin/tenants/{tenantId}/status`
- **Access:** Super Admin

#### Request Body
```json
{
  "status": "Suspended",
  "reason": "Payment overdue on annual enterprise shard renewal."
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "id": "tenant-palm",
    "code": "PALM",
    "status": "Suspended",
    "suspendedAt": "2026-10-15T12:00:00.000Z"
  }
}
```

---

## 5. Resort Owner Account Management

### 5.1 List All Resort Owners Across Tenants
- **Method:** `GET`
- **Path:** `/api/v1/superadmin/owners`
- **Query Parameters:**
  - `tenantCode`: Filter by specific resort (optional)
  - `active`: `true` | `false` (optional)
- **Access:** Super Admin

#### Response (`200 OK`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "owners": [
      {
        "id": "owner-palm-01",
        "name": "Vikram Oberoi",
        "email": "owner@rrms.demo",
        "module": "Owner",
        "role": "Owner",
        "tenantId": "PALM",
        "active": true
      },
      {
        "id": "owner-azur-01",
        "name": "Aarav Singhania",
        "email": "aarav.singhania@azurebay.demo",
        "module": "Owner",
        "role": "Owner",
        "tenantId": "AZUR",
        "active": true
      }
    ],
    "totalCount": 2
  }
}
```

---

### 5.2 Update Owner Profile & Credentials
- **Method:** `PUT`
- **Path:** `/api/v1/superadmin/owners/{ownerId}`
- **Access:** Super Admin

#### Request Body
```json
{
  "name": "Vikram K. Oberoi",
  "email": "vikram.oberoi@palmluxury.com",
  "password": "NewResortSecurePass@2026",
  "active": true
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "id": "owner-palm-01",
    "name": "Vikram K. Oberoi",
    "email": "vikram.oberoi@palmluxury.com",
    "module": "Owner",
    "role": "Owner",
    "tenantId": "PALM",
    "active": true,
    "updatedAt": "2026-10-15T12:00:00.000Z"
  }
}
```

---

### 5.3 Reset Owner Password Administratively
- **Method:** `POST`
- **Path:** `/api/v1/superadmin/owners/{ownerId}/reset-password`
- **Access:** Super Admin

#### Request Body
```json
{
  "temporaryPassword": "Resort@Temp2026!"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "ownerId": "owner-palm-01",
    "email": "owner@rrms.demo",
    "message": "Temporary password assigned successfully. Owner will be prompted to change on next login."
  }
}
```

---

## 6. Support Tickets & Engineering Escalations

### 6.1 List Support Tickets
- **Method:** `GET`
- **Path:** `/api/v1/superadmin/tickets`
- **Query Parameters:**
  - `status`: `ALL` | `OPEN` | `IN_PROGRESS` | `RESOLVED` | `CLOSED` (default: `ALL`)
  - `priority`: `ALL` | `CRITICAL` | `HIGH` | `MEDIUM` | `LOW` (default: `ALL`)
  - `tenantCode`: Filter by resort code (optional)
  - `page`: Default `1`
  - `limit`: Default `50`
- **Access:** Super Admin

#### Response (`200 OK`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "tickets": [
      {
        "id": "TK-1023",
        "tenantCode": "PALM",
        "resortName": "The Palm Luxury Resort",
        "ownerName": "Vikram Oberoi",
        "ownerEmail": "owner@rrms.demo",
        "creatorId": "owner",
        "assigneeId": "superadmin",
        "assigneeName": "Platform Administrator",
        "assigneeEmail": "admin@rrms.demo",
        "title": "guest of room 201 face some issue",
        "category": "Technical Issue",
        "priority": "HIGH",
        "status": "OPEN",
        "description": "guest of room 201 not able to add amenities",
        "attachmentsCount": 1,
        "repliesCount": 0,
        "createdAt": "2026-10-15T09:15:00.000Z",
        "updatedAt": "2026-10-15T09:15:00.000Z"
      }
    ],
    "totalCount": 1,
    "page": 1,
    "limit": 50
  }
}
```

---

### 6.2 Get Ticket Details with Replies & Timeline
- **Method:** `GET`
- **Path:** `/api/v1/superadmin/tickets/{ticketId}`
- **Access:** Super Admin

#### Response (`200 OK`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "id": "TK-1023",
    "tenantCode": "PALM",
    "resortName": "The Palm Luxury Resort",
    "ownerName": "Vikram Oberoi",
    "ownerEmail": "owner@rrms.demo",
    "creatorId": "owner",
    "assigneeId": "superadmin",
    "assigneeName": "Platform Administrator",
    "assigneeEmail": "admin@rrms.demo",
    "title": "guest of room 201 face some issue",
    "category": "Technical Issue",
    "priority": "HIGH",
    "status": "OPEN",
    "description": "guest of room 201 not able to add amenities",
    "resolutionNotes": "",
    "attachments": [
      {
        "id": "att-101",
        "name": "amenity_modal_error.png",
        "type": "image/png",
        "size": 154200,
        "dataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
      }
    ],
    "replies": [
      {
        "id": "TR-9021",
        "senderId": "superadmin",
        "senderName": "Platform Administrator",
        "senderRole": "SUPER_ADMIN",
        "message": "Investigating room 201 amenity catalogue lock status. Will update within 30 minutes.",
        "attachments": [],
        "timestamp": "2026-10-15T09:30:00.000Z"
      }
    ],
    "history": [
      {
        "id": "TH-1001",
        "timestamp": "2026-10-15T09:15:00.000Z",
        "actorName": "Vikram Oberoi",
        "actorRole": "Owner",
        "action": "TICKET_CREATED",
        "details": "Ticket opened with priority HIGH"
      },
      {
        "id": "TH-1002",
        "timestamp": "2026-10-15T09:30:00.000Z",
        "actorName": "Platform Administrator",
        "actorRole": "SUPER_ADMIN",
        "action": "REPLY_ADDED",
        "details": "Platform Administrator posted a reply"
      }
    ],
    "createdAt": "2026-10-15T09:15:00.000Z",
    "updatedAt": "2026-10-15T09:30:00.000Z"
  }
}
```

---

### 6.3 Create Support Ticket Administratively
- **Method:** `POST`
- **Path:** `/api/v1/superadmin/tickets`
- **Access:** Super Admin

#### Request Body
```json
{
  "tenantCode": "PALM",
  "title": "Payment gateway webhook latency spike",
  "category": "Integration Failure",
  "priority": "CRITICAL",
  "description": "Razorpay webhook responses exceeding 4500ms timeout threshold for resort PALM.",
  "attachments": []
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "id": "TK-4821",
    "tenantCode": "PALM",
    "title": "Payment gateway webhook latency spike",
    "category": "Integration Failure",
    "priority": "CRITICAL",
    "status": "OPEN",
    "assigneeId": "superadmin",
    "createdAt": "2026-10-15T12:00:00.000Z"
  }
}
```

---

### 6.4 Update Ticket Status, Priority & Resolution Notes
- **Method:** `PUT`
- **Path:** `/api/v1/superadmin/tickets/{ticketId}`
- **Access:** Super Admin

#### Request Body
```json
{
  "status": "RESOLVED",
  "priority": "HIGH",
  "resolutionNotes": "Repaired catalog reservation link constraint for room 201. Amenities ordering verified."
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "id": "TK-1023",
    "status": "RESOLVED",
    "priority": "HIGH",
    "resolutionNotes": "Repaired catalog reservation link constraint for room 201. Amenities ordering verified.",
    "updatedAt": "2026-10-15T12:00:00.000Z"
  }
}
```

---

### 6.5 Add Super Admin Reply to Ticket
- **Method:** `POST`
- **Path:** `/api/v1/superadmin/tickets/{ticketId}/replies`
- **Access:** Super Admin

#### Request Body
```json
{
  "message": "The amenity catalogue synchronization has been patched for room 201. The guest can now add amenities freely.",
  "replyAttachments": [
    {
      "name": "verification_screenshot.png",
      "type": "image/png",
      "size": 182000,
      "dataUrl": "data:image/png;base64,iVBORw0KGgoAAA..."
    }
  ]
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "replyId": "TR-9045",
    "senderId": "superadmin",
    "senderName": "Platform Administrator",
    "senderRole": "SUPER_ADMIN",
    "message": "The amenity catalogue synchronization has been patched for room 201. The guest can now add amenities freely.",
    "attachmentsCount": 1,
    "timestamp": "2026-10-15T12:00:00.000Z"
  }
}
```

---

## 7. Platform Governance & Cluster Configuration

### 7.1 Get Global Configuration Parameters
- **Method:** `GET`
- **Path:** `/api/v1/superadmin/config`
- **Access:** Super Admin

#### Response (`200 OK`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "maintenanceMode": false,
    "registrationOpen": false,
    "maxTenants": 50,
    "sessionTimeoutMinutes": 60,
    "telemetryIntervalSeconds": 30,
    "backupSchedule": "Daily @ 02:00 UTC",
    "enforceMfa": false,
    "logRetentionDays": 90,
    "defaultTimezone": "Asia/Kolkata (IST)"
  }
}
```

---

### 7.2 Update Global Configuration Parameters
- **Method:** `PUT`
- **Path:** `/api/v1/superadmin/config`
- **Access:** Super Admin

#### Request Body
```json
{
  "maintenanceMode": false,
  "registrationOpen": false,
  "maxTenants": 75,
  "sessionTimeoutMinutes": 45,
  "telemetryIntervalSeconds": 15,
  "backupSchedule": "Daily @ 01:00 UTC",
  "enforceMfa": true,
  "logRetentionDays": 120,
  "defaultTimezone": "Asia/Kolkata (IST)"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "maintenanceMode": false,
    "registrationOpen": false,
    "maxTenants": 75,
    "sessionTimeoutMinutes": 45,
    "telemetryIntervalSeconds": 15,
    "backupSchedule": "Daily @ 01:00 UTC",
    "enforceMfa": true,
    "logRetentionDays": 120,
    "defaultTimezone": "Asia/Kolkata (IST)",
    "updatedAt": "2026-10-15T12:00:00.000Z"
  }
}
```

---

### 7.3 Toggle Cluster Maintenance Mode
- **Method:** `POST`
- **Path:** `/api/v1/superadmin/config/maintenance/toggle`
- **Access:** Super Admin

#### Response (`200 OK`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "maintenanceMode": true,
    "message": "Platform maintenance mode has been ENABLED. Public tenant access suspended."
  }
}
```

---

## 8. Platform Security & Governance Audit Trail

### 8.1 Query Audit Logs
- **Method:** `GET`
- **Path:** `/api/v1/superadmin/audit`
- **Query Parameters:**
  - `severity`: `ALL` | `INFO` | `WARNING` | `CRITICAL` (default: `ALL`)
  - `tenantCode`: Filter by resort code or `PLATFORM` (optional)
  - `startDate`: ISO 8601 string (optional)
  - `endDate`: ISO 8601 string (optional)
  - `page`: Default `1`
  - `limit`: Default `50`
- **Access:** Super Admin

#### Response (`200 OK`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "logs": [
      {
        "id": "PA-1792055000",
        "timestamp": "2026-10-15T12:00:00.000Z",
        "actor": "Platform Administrator",
        "action": "TENANT_PROVISIONED",
        "tenantCode": "HERI",
        "severity": "INFO",
        "details": "Provisioned resort \"The Heritage Palace Resort\" [HERI] and created Owner account gajraj.singh@heritagepalace.demo"
      },
      {
        "id": "PA-1792054800",
        "timestamp": "2026-10-15T11:45:00.000Z",
        "actor": "Platform Administrator",
        "action": "PLATFORM_CONFIG_UPDATED",
        "tenantCode": "PLATFORM",
        "severity": "WARNING",
        "details": "Updated global platform parameters: enforceMfa set to true"
      }
    ],
    "totalCount": 2,
    "page": 1,
    "limit": 50
  }
}
```

---

### 8.2 Create Custom Platform Audit Event
- **Method:** `POST`
- **Path:** `/api/v1/superadmin/audit`
- **Access:** Super Admin

#### Request Body
```json
{
  "action": "SECURITY_KEY_ROTATED",
  "tenantCode": "PLATFORM",
  "severity": "WARNING",
  "details": "Master JWT signing certificate rotated by Platform Administrator."
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "id": "PA-1792056000",
    "timestamp": "2026-10-15T12:00:00.000Z",
    "actor": "Platform Administrator",
    "action": "SECURITY_KEY_ROTATED",
    "tenantCode": "PLATFORM",
    "severity": "WARNING",
    "details": "Master JWT signing certificate rotated by Platform Administrator."
  }
}
```

---

### 8.3 Export Audit Trail CSV
- **Method:** `GET`
- **Path:** `/api/v1/superadmin/audit/export`
- **Access:** Super Admin
- **Response Format:** `text/csv` stream with header `Content-Disposition: attachment; filename=platform-audit-logs.csv`

---

## 9. Infrastructure Telemetry & Node Monitoring

### 9.1 Get Real-Time Cluster Telemetry
- **Method:** `GET`
- **Path:** `/api/v1/superadmin/monitoring/telemetry`
- **Access:** Super Admin

#### Response (`200 OK`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "clusterHealth": "OPERATIONAL",
    "clusterUptimeSeconds": 1428500,
    "nodes": [
      {
        "id": "node-in-bom-01",
        "region": "ap-south-1a",
        "status": "HEALTHY",
        "cpuUsagePercent": 14.2,
        "memoryAllocatedMb": 2048,
        "memoryUsedMb": 782,
        "activeConnections": 64
      },
      {
        "id": "node-in-bom-02",
        "region": "ap-south-1b",
        "status": "HEALTHY",
        "cpuUsagePercent": 17.8,
        "memoryAllocatedMb": 2048,
        "memoryUsedMb": 894,
        "activeConnections": 72
      }
    ],
    "databasePool": {
      "activeConnections": 28,
      "idleConnections": 72,
      "maxPoolSize": 100,
      "queryLatencyMs": 1.4
    },
    "shards": {
      "healthyCount": 8,
      "degradedCount": 0,
      "syncStatus": "SYNCHRONIZED"
    }
  }
}
```

---

### 9.2 Trigger Distributed Telemetry Node Sync
- **Method:** `POST`
- **Path:** `/api/v1/superadmin/monitoring/sync`
- **Access:** Super Admin

#### Response (`200 OK`)
```json
{
  "success": true,
  "timestamp": "2026-10-15T12:00:00.000Z",
  "data": {
    "syncedNodesCount": 4,
    "latencyMs": 18,
    "status": "SYNCHRONIZED",
    "message": "Telemetry counters refreshed from all distributed cluster nodes."
  }
}
```

---

## 10. Summary Quick Reference Table

| Category | HTTP Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/superadmin/login` | Authenticate Super Admin |
| **Auth** | `POST` | `/api/v1/auth/superadmin/mfa/verify` | Validate 2FA token |
| **Auth** | `GET` | `/api/v1/auth/me` | Fetch active session & permissions |
| **Auth** | `POST` | `/api/v1/auth/logout` | Invalidate current session |
| **Overview** | `GET` | `/api/v1/superadmin/overview/stats` | Aggregated platform KPIs |
| **Overview** | `GET` | `/api/v1/superadmin/overview/activity` | Incident alerts & recent audit events |
| **Tenants** | `GET` | `/api/v1/superadmin/tenants` | List all resort shards |
| **Tenants** | `GET` | `/api/v1/superadmin/tenants/{id}` | Get specific resort details |
| **Tenants** | `POST` | `/api/v1/superadmin/tenants` | Provision resort & primary Owner account |
| **Tenants** | `PUT` | `/api/v1/superadmin/tenants/{id}` | Update resort metadata / room count |
| **Tenants** | `PATCH` | `/api/v1/superadmin/tenants/{id}/status` | Toggle shard status (Active/Suspended) |
| **Owners** | `GET` | `/api/v1/superadmin/owners` | List all Resort Owner executive accounts |
| **Owners** | `PUT` | `/api/v1/superadmin/owners/{id}` | Update Owner profile & credentials |
| **Owners** | `POST` | `/api/v1/superadmin/owners/{id}/reset-password` | Issue administrative password reset |
| **Tickets** | `GET` | `/api/v1/superadmin/tickets` | Query support tickets with filters |
| **Tickets** | `GET` | `/api/v1/superadmin/tickets/{id}` | View full conversation thread & history |
| **Tickets** | `POST` | `/api/v1/superadmin/tickets` | Create/log incident ticket |
| **Tickets** | `PUT` | `/api/v1/superadmin/tickets/{id}` | Transition status, priority & notes |
| **Tickets** | `POST` | `/api/v1/superadmin/tickets/{id}/replies` | Add official reply with attachments |
| **Config** | `GET` | `/api/v1/superadmin/config` | Read platform cluster parameters |
| **Config** | `PUT` | `/api/v1/superadmin/config` | Update global cluster parameters |
| **Config** | `POST` | `/api/v1/superadmin/config/maintenance/toggle` | Instantly toggle maintenance mode |
| **Audit** | `GET` | `/api/v1/superadmin/audit` | Query immutable audit trail |
| **Audit** | `POST` | `/api/v1/superadmin/audit` | Append platform audit event |
| **Audit** | `GET` | `/api/v1/superadmin/audit/export` | Download audit log in CSV format |
| **Monitoring** | `GET` | `/api/v1/superadmin/monitoring/telemetry` | Real-time cluster CPU, DB pool, and memory |
| **Monitoring** | `POST` | `/api/v1/superadmin/monitoring/sync` | Force refresh node heartbeat |
