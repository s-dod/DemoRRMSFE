# Super Admin Module: Entities & Classes Specification

> **Module:** Super Admin (Platform Governance & Multi-Tenant Core)  
> **Platform Boundary Rule:** Operates at the root cluster level (`tenantId: null`). Governs multi-tenant shards, platform user credentials, MFA policies, technical escalations, platform telemetry, and system-wide configuration.  
> **Architecture:** Modular Monolithic  
> **Language:** TypeScript

---

## 1. Directory Structure (Super Admin Module)

```text
src/modules/super-admin/
├── contracts/                               # Public API exposed to other modules
│   ├── super-admin-module-api.interface.ts  # Synchronous facade methods
│   └── dtos/
│       ├── tenant-summary.dto.ts
│       ├── platform-health.dto.ts
│       └── super-admin-auth.dto.ts
├── domain/                                  # Pure Domain Core
│   ├── enums/
│   │   ├── tenant-status.enum.ts
│   │   ├── subscription-tier.enum.ts
│   │   ├── ticket-priority.enum.ts
│   │   ├── ticket-status.enum.ts
│   │   ├── ticket-category.enum.ts
│   │   ├── audit-severity.enum.ts
│   │   └── super-admin-role.enum.ts
│   ├── value-objects/
│   │   ├── tenant-id.vo.ts
│   │   ├── ticket-id.vo.ts
│   │   ├── super-admin-id.vo.ts
│   │   └── tenant-owner-info.vo.ts
│   ├── entities/
│   │   ├── tenant.aggregate.ts              # Resort Tenant Aggregate Root
│   │   ├── super-admin-user.aggregate.ts    # Platform User Aggregate Root
│   │   ├── platform-ticket.aggregate.ts     # Support Escalation Aggregate Root
│   │   ├── ticket-reply.entity.ts           # Ticket Conversation Reply
│   │   ├── ticket-attachment.entity.ts      # Diagnostic Media File
│   │   ├── ticket-history-entry.entity.ts   # Ticket Audit Trail
│   │   ├── platform-config.aggregate.ts     # Cluster Singleton Configuration
│   │   ├── platform-audit-log.entity.ts     # Platform Operations Audit Entry
│   │   └── system-telemetry.entity.ts       # Health & Cluster Telemetry Snapshot
│   ├── events/
│   │   ├── tenant-provisioned.event.ts
│   │   ├── tenant-status-changed.event.ts
│   │   ├── ticket-escalated.event.ts
│   │   └── maintenance-mode-toggled.event.ts
│   └── repositories/
│       ├── tenant.repository.interface.ts
│       ├── super-admin-user.repository.interface.ts
│       ├── platform-ticket.repository.interface.ts
│       ├── platform-config.repository.interface.ts
│       └── platform-audit.repository.interface.ts
├── application/                             # Use Cases & Handlers
│   ├── commands/
│   │   ├── provision-tenant.command.ts
│   │   ├── update-platform-config.command.ts
│   │   └── resolve-platform-ticket.command.ts
│   ├── queries/
│   │   ├── get-platform-telemetry.query.ts
│   │   └── list-tenants.query.ts
│   └── handlers/
└── infrastructure/                          # Persistence & Module Facade
    ├── persistence/
    └── facade/
        └── super-admin-module.facade.ts
```

---

## 2. Enums & Value Objects

### 2.1 Domain Enums (`src/modules/super-admin/domain/enums/`)

```typescript
// tenant-status.enum.ts
export enum TenantStatus {
  ACTIVE = 'Active',
  SUSPENDED = 'Suspended',
  PENDING = 'Pending',
  ARCHIVED = 'Archived'
}

// subscription-tier.enum.ts
export enum SubscriptionTier {
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
  CUSTOM_PARTNER = 'CUSTOM_PARTNER'
}

// ticket-priority.enum.ts
export enum TicketPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

// ticket-status.enum.ts
export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

// ticket-category.enum.ts
export enum TicketCategory {
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  BILLING = 'BILLING',
  AUTHENTICATION = 'AUTHENTICATION',
  DATA_CORRUPTION = 'DATA_CORRUPTION',
  FEATURE_REQUEST = 'FEATURE_REQUEST',
  GENERAL_SUPPORT = 'GENERAL_SUPPORT'
}

// audit-severity.enum.ts
export enum PlatformAuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL'
}

// super-admin-role.enum.ts
export enum SuperAdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SUPPORT_SPECIALIST = 'SUPPORT_SPECIALIST',
  PLATFORM_AUDITOR = 'PLATFORM_AUDITOR'
}
```

---

### 2.2 Domain Value Objects (`src/modules/super-admin/domain/value-objects/`)

```typescript
// tenant-id.vo.ts
import { ValueObject } from '../../../../shared/domain/value-object';

export class TenantId extends ValueObject<{ value: string }> {
  public get value(): string { return this.props.value; }
  public static create(value: string = crypto.randomUUID()): TenantId {
    return new TenantId({ value });
  }
}

// ticket-id.vo.ts
export class TicketId extends ValueObject<{ value: string }> {
  public get value(): string { return this.props.value; }
  public static create(value: string = crypto.randomUUID()): TicketId {
    return new TicketId({ value });
  }
}

// super-admin-id.vo.ts
export class SuperAdminId extends ValueObject<{ value: string }> {
  public get value(): string { return this.props.value; }
  public static create(value: string = crypto.randomUUID()): SuperAdminId {
    return new SuperAdminId({ value });
  }
}

// tenant-owner-info.vo.ts
import { Email } from '../../../../shared/domain/value-objects/email.vo';

export class TenantOwnerInfo extends ValueObject<{
  ownerId: string;
  ownerName: string;
  ownerEmail: Email;
  ownerPhone: string;
}> {
  public get ownerId(): string { return this.props.ownerId; }
  public get ownerName(): string { return this.props.ownerName; }
  public get ownerEmail(): Email { return this.props.ownerEmail; }
  public get ownerPhone(): string { return this.props.ownerPhone; }

  public static create(ownerId: string, name: string, email: Email, phone: string): TenantOwnerInfo {
    return new TenantOwnerInfo({
      ownerId,
      ownerName: name.trim(),
      ownerEmail: email,
      ownerPhone: phone.trim()
    });
  }
}
```

---

## 3. Entities & Aggregate Roots

### 3.1 Tenant Aggregate Root (`src/modules/super-admin/domain/entities/tenant.aggregate.ts`)

```typescript
import { AggregateRoot } from '../../../../shared/domain/aggregate-root';
import { Result, AppError } from '../../../../shared/domain/result';
import { TenantId } from '../value-objects/tenant-id.vo';
import { TenantOwnerInfo } from '../value-objects/tenant-owner-info.vo';
import { TenantStatus } from '../enums/tenant-status.enum';
import { SubscriptionTier } from '../enums/subscription-tier.enum';
import { TenantProvisionedEvent } from '../events/tenant-provisioned.event';
import { TenantStatusChangedEvent } from '../events/tenant-status-changed.event';

export interface CreateTenantProps {
  id: TenantId;
  code: string;
  name: string;
  tier: SubscriptionTier;
  owner: TenantOwnerInfo;
  location: string;
  roomsCount: number;
  databaseShardId?: string;
}

export class Tenant extends AggregateRoot<TenantId> {
  public code: string;
  public name: string;
  public status: TenantStatus;
  public tier: SubscriptionTier;
  public owner: TenantOwnerInfo;
  public location: string;
  public roomsCount: number;
  public databaseShardId: string;
  public suspendedReason?: string;

  private constructor(props: CreateTenantProps, actor: string) {
    super(props.id, actor);
    this.code = props.code.toUpperCase().trim();
    this.name = props.name.trim();
    this.status = TenantStatus.PENDING;
    this.tier = props.tier;
    this.owner = props.owner;
    this.location = props.location;
    this.roomsCount = props.roomsCount;
    this.databaseShardId = props.databaseShardId || 'shard-us-east-1';
  }

  public static create(props: CreateTenantProps, actor: string): Result<Tenant> {
    if (!props.code || props.code.trim().length < 3) {
      return Result.fail(AppError.validation('Tenant code must be at least 3 characters.'));
    }
    if (!props.name || props.name.trim().length < 2) {
      return Result.fail(AppError.validation('Tenant name must be at least 2 characters.'));
    }

    const tenant = new Tenant(props, actor);
    tenant.addDomainEvent(new TenantProvisionedEvent(tenant.id.value, tenant.code, tenant.name));
    return Result.ok(tenant);
  }

  public activate(actor: string): Result<void> {
    if (this.status === TenantStatus.ACTIVE) {
      return Result.fail(AppError.conflict('Tenant shard is already active.'));
    }
    const oldStatus = this.status;
    this.status = TenantStatus.ACTIVE;
    this.suspendedReason = undefined;
    this.touch(actor);
    this.addDomainEvent(new TenantStatusChangedEvent(this.id.value, this.code, oldStatus, this.status));
    return Result.voidOk();
  }

  public suspend(reason: string, actor: string): Result<void> {
    if (this.status === TenantStatus.SUSPENDED) {
      return Result.fail(AppError.conflict('Tenant shard is already suspended.'));
    }
    const oldStatus = this.status;
    this.status = TenantStatus.SUSPENDED;
    this.suspendedReason = reason;
    this.touch(actor);
    this.addDomainEvent(new TenantStatusChangedEvent(this.id.value, this.code, oldStatus, this.status, reason));
    return Result.voidOk();
  }

  public upgradeTier(newTier: SubscriptionTier, actor: string): void {
    this.tier = newTier;
    this.touch(actor);
  }

  public updateCapacity(roomsCount: number, actor: string): void {
    this.roomsCount = Math.max(0, roomsCount);
    this.touch(actor);
  }
}
```

---

### 3.2 Super Admin User Aggregate Root (`src/modules/super-admin/domain/entities/super-admin-user.aggregate.ts`)

```typescript
import { AggregateRoot } from '../../../../shared/domain/aggregate-root';
import { Result, AppError } from '../../../../shared/domain/result';
import { Email } from '../../../../shared/domain/value-objects/email.vo';
import { SuperAdminId } from '../value-objects/super-admin-id.vo';
import { SuperAdminRole } from '../enums/super-admin-role.enum';

export class SuperAdminUser extends AggregateRoot<SuperAdminId> {
  public name: string;
  public email: Email;
  public passwordHash: string;
  public role: SuperAdminRole;
  public active: boolean;
  public mfaRequired: boolean;
  public mfaSecret?: string;
  public lastLoginAt?: Date;

  public constructor(
    id: SuperAdminId,
    name: string,
    email: Email,
    passwordHash: string,
    role: SuperAdminRole = SuperAdminRole.SUPER_ADMIN,
    mfaRequired: boolean = false,
    actor: string = 'PLATFORM_ROOT'
  ) {
    super(id, actor);
    this.name = name.trim();
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.active = true;
    this.mfaRequired = mfaRequired;
  }

  public recordLogin(actor: string): void {
    this.lastLoginAt = new Date();
    this.touch(actor);
  }

  public enableMfa(secret: string, actor: string): void {
    this.mfaSecret = secret;
    this.mfaRequired = true;
    this.touch(actor);
  }

  public disableMfa(actor: string): void {
    this.mfaSecret = undefined;
    this.mfaRequired = false;
    this.touch(actor);
  }

  public deactivate(actor: string): void {
    this.active = false;
    this.touch(actor);
  }
}
```

---

### 3.3 Platform Support Ticket Aggregate Root (`src/modules/super-admin/domain/entities/platform-ticket.aggregate.ts`)

```typescript
import { AggregateRoot } from '../../../../shared/domain/aggregate-root';
import { Result, AppError } from '../../../../shared/domain/result';
import { TicketId } from '../value-objects/ticket-id.vo';
import { TicketPriority } from '../enums/ticket-priority.enum';
import { TicketStatus } from '../enums/ticket-status.enum';
import { TicketCategory } from '../enums/ticket-category.enum';
import { TicketReply } from './ticket-reply.entity';
import { TicketAttachment } from './ticket-attachment.entity';
import { TicketHistoryEntry } from './ticket-history-entry.entity';
import { TicketEscalatedEvent } from '../events/ticket-escalated.event';

export interface CreatePlatformTicketProps {
  id: TicketId;
  tenantCode: string;
  resortName: string;
  ownerName: string;
  ownerEmail: string;
  creatorId?: string;
  title: string;
  category: TicketCategory;
  priority: TicketPriority;
  description: string;
  attachments?: TicketAttachment[];
}

export class PlatformTicket extends AggregateRoot<TicketId> {
  public tenantCode: string;
  public resortName: string;
  public ownerName: string;
  public ownerEmail: string;
  public creatorId?: string;
  public assigneeId?: string;
  public assigneeName?: string;
  public title: string;
  public category: TicketCategory;
  public priority: TicketPriority;
  public status: TicketStatus;
  public description: string;
  public resolutionNotes?: string;
  public attachments: TicketAttachment[];
  public replies: TicketReply[];
  public history: TicketHistoryEntry[];

  private constructor(props: CreatePlatformTicketProps, actor: string) {
    super(props.id, actor);
    this.tenantCode = props.tenantCode;
    this.resortName = props.resortName;
    this.ownerName = props.ownerName;
    this.ownerEmail = props.ownerEmail;
    this.creatorId = props.creatorId;
    this.title = props.title.trim();
    this.category = props.category;
    this.priority = props.priority;
    this.status = TicketStatus.OPEN;
    this.description = props.description;
    this.attachments = props.attachments || [];
    this.replies = [];
    this.history = [
      new TicketHistoryEntry(crypto.randomUUID(), actor, 'CREATOR', 'Ticket created', props.description)
    ];
  }

  public static create(props: CreatePlatformTicketProps, actor: string): Result<PlatformTicket> {
    if (!props.title || props.title.trim().length < 5) {
      return Result.fail(AppError.validation('Ticket title must be at least 5 characters.'));
    }
    const ticket = new PlatformTicket(props, actor);
    return Result.ok(ticket);
  }

  public assignAgent(agentId: string, agentName: string, actor: string): void {
    this.assigneeId = agentId;
    this.assigneeName = agentName;
    this.status = TicketStatus.IN_PROGRESS;
    this.history.push(
      new TicketHistoryEntry(crypto.randomUUID(), actor, 'ADMIN', 'Assigned agent', `Assigned to ${agentName}`)
    );
    this.touch(actor);
  }

  public addReply(senderId: string, senderName: string, senderRole: string, message: string, attachments?: TicketAttachment[]): void {
    const reply = new TicketReply(crypto.randomUUID(), senderId, senderName, senderRole, message, attachments);
    this.replies.push(reply);
    this.touch(senderName);
  }

  public escalateToCritical(reason: string, actor: string): void {
    this.priority = TicketPriority.CRITICAL;
    this.history.push(
      new TicketHistoryEntry(crypto.randomUUID(), actor, 'ADMIN', 'Escalated priority to CRITICAL', reason)
    );
    this.touch(actor);
    this.addDomainEvent(new TicketEscalatedEvent(this.id.value, this.tenantCode, this.title, reason));
  }

  public resolve(notes: string, actor: string): Result<void> {
    if (this.status === TicketStatus.CLOSED) {
      return Result.fail(AppError.conflict('Cannot resolve an already closed ticket.'));
    }
    this.status = TicketStatus.RESOLVED;
    this.resolutionNotes = notes;
    this.history.push(
      new TicketHistoryEntry(crypto.randomUUID(), actor, 'ADMIN', 'Resolved ticket', notes)
    );
    this.touch(actor);
    return Result.voidOk();
  }

  public close(actor: string): void {
    this.status = TicketStatus.CLOSED;
    this.history.push(
      new TicketHistoryEntry(crypto.randomUUID(), actor, 'ADMIN', 'Closed ticket')
    );
    this.touch(actor);
  }
}
```

---

### 3.4 Ticket Child Entities (`src/modules/super-admin/domain/entities/`)

```typescript
// ticket-reply.entity.ts
import { BaseEntity } from '../../../../shared/domain/base-entity';
import { TicketAttachment } from './ticket-attachment.entity';

export class TicketReply extends BaseEntity<string> {
  public constructor(
    id: string,
    public readonly senderId: string,
    public readonly senderName: string,
    public readonly senderRole: string,
    public readonly message: string,
    public readonly attachments: TicketAttachment[] = [],
    public readonly timestamp: Date = new Date()
  ) {
    super(id);
  }
}

// ticket-attachment.entity.ts
export class TicketAttachment extends BaseEntity<string> {
  public constructor(
    id: string,
    public readonly name: string,
    public readonly mimeType: string,
    public readonly sizeBytes: number,
    public readonly dataUrl: string
  ) {
    super(id);
  }
}

// ticket-history-entry.entity.ts
export class TicketHistoryEntry extends BaseEntity<string> {
  public constructor(
    id: string,
    public readonly actorName: string,
    public readonly actorRole: string,
    public readonly action: string,
    public readonly details?: string,
    public readonly timestamp: Date = new Date()
  ) {
    super(id);
  }
}
```

---

### 3.5 Platform Config & Audit Log Entities

```typescript
// platform-config.aggregate.ts
import { AggregateRoot } from '../../../../shared/domain/aggregate-root';
import { MaintenanceModeToggledEvent } from '../events/maintenance-mode-toggled.event';

export class PlatformConfig extends AggregateRoot<string> {
  public maintenanceMode: boolean;
  public registrationOpen: boolean;
  public maxTenants: number;
  public sessionTimeoutMinutes: number;
  public telemetryIntervalSeconds: number;
  public backupSchedule: string;
  public enforceMfa: boolean;
  public logRetentionDays: number;
  public defaultTimezone: string;

  public constructor(
    id: string = 'GLOBAL_CONFIG',
    maintenanceMode: boolean = false,
    registrationOpen: boolean = true,
    maxTenants: number = 500,
    sessionTimeoutMinutes: number = 60,
    telemetryIntervalSeconds: number = 30,
    backupSchedule: string = '0 2 * * *',
    enforceMfa: boolean = false,
    logRetentionDays: number = 90,
    defaultTimezone: string = 'UTC',
    actor: string = 'SYSTEM'
  ) {
    super(id, actor);
    this.maintenanceMode = maintenanceMode;
    this.registrationOpen = registrationOpen;
    this.maxTenants = maxTenants;
    this.sessionTimeoutMinutes = sessionTimeoutMinutes;
    this.telemetryIntervalSeconds = telemetryIntervalSeconds;
    this.backupSchedule = backupSchedule;
    this.enforceMfa = enforceMfa;
    this.logRetentionDays = logRetentionDays;
    this.defaultTimezone = defaultTimezone;
  }

  public setMaintenanceMode(enabled: boolean, reason: string, actor: string): void {
    if (this.maintenanceMode !== enabled) {
      this.maintenanceMode = enabled;
      this.touch(actor);
      this.addDomainEvent(new MaintenanceModeToggledEvent(this.id, enabled, reason));
    }
  }

  public updateSecuritySettings(enforceMfa: boolean, sessionTimeout: number, actor: string): void {
    this.enforceMfa = enforceMfa;
    this.sessionTimeoutMinutes = sessionTimeout;
    this.touch(actor);
  }
}

// platform-audit-log.entity.ts
import { BaseEntity } from '../../../../shared/domain/base-entity';
import { PlatformAuditSeverity } from '../enums/audit-severity.enum';

export class PlatformAuditLog extends BaseEntity<string> {
  public constructor(
    id: string,
    public readonly actor: string,
    public readonly action: string,
    public readonly details: string,
    public readonly severity: PlatformAuditSeverity = PlatformAuditSeverity.INFO,
    public readonly tenantCode?: string,
    public readonly ipAddress: string = '127.0.0.1',
    public readonly timestamp: Date = new Date()
  ) {
    super(id);
  }
}

// system-telemetry.entity.ts
export class SystemTelemetrySnapshot extends BaseEntity<string> {
  public constructor(
    id: string,
    public readonly activeTenants: number,
    public readonly totalRoomsManaged: number,
    public readonly cpuUsagePercent: number,
    public readonly memoryUsagePercent: number,
    public readonly openCriticalTickets: number,
    public readonly apiRequestsPerMinute: number,
    public readonly timestamp: Date = new Date()
  ) {
    super(id);
  }
}
```

---

## 4. Domain Events

```typescript
// tenant-provisioned.event.ts
import { BaseDomainEvent } from '../../../../shared/domain/domain-event.base';

export class TenantProvisionedEvent extends BaseDomainEvent {
  public readonly eventType = 'SuperAdmin.TenantProvisioned';
  public constructor(
    aggregateId: string,
    public readonly code: string,
    public readonly name: string
  ) {
    super(aggregateId);
  }
}

// tenant-status-changed.event.ts
export class TenantStatusChangedEvent extends BaseDomainEvent {
  public readonly eventType = 'SuperAdmin.TenantStatusChanged';
  public constructor(
    aggregateId: string,
    public readonly tenantCode: string,
    public readonly oldStatus: string,
    public readonly newStatus: string,
    public readonly reason?: string
  ) {
    super(aggregateId);
  }
}

// ticket-escalated.event.ts
export class TicketEscalatedEvent extends BaseDomainEvent {
  public readonly eventType = 'SuperAdmin.TicketEscalated';
  public constructor(
    aggregateId: string,
    public readonly tenantCode: string,
    public readonly title: string,
    public readonly reason: string
  ) {
    super(aggregateId);
  }
}

// maintenance-mode-toggled.event.ts
export class MaintenanceModeToggledEvent extends BaseDomainEvent {
  public readonly eventType = 'SuperAdmin.MaintenanceModeToggled';
  public constructor(
    aggregateId: string,
    public readonly isEnabled: boolean,
    public readonly reason: string
  ) {
    super(aggregateId);
  }
}
```

---

## 5. Repositories & Public Module Facade

### 5.1 Repository Interfaces (`src/modules/super-admin/domain/repositories/`)

```typescript
import { IRepository } from '../../../../shared/application/repository.interface';
import { Tenant } from '../entities/tenant.aggregate';
import { TenantId } from '../value-objects/tenant-id.vo';
import { SuperAdminUser } from '../entities/super-admin-user.aggregate';
import { SuperAdminId } from '../value-objects/super-admin-id.vo';
import { PlatformTicket } from '../entities/platform-ticket.aggregate';
import { TicketId } from '../value-objects/ticket-id.vo';
import { PlatformConfig } from '../entities/platform-config.aggregate';
import { PlatformAuditLog } from '../entities/platform-audit-log.entity';

export interface ITenantRepository extends IRepository<Tenant, TenantId> {
  findByCode(code: string): Promise<Tenant | null>;
  findActiveTenants(): Promise<Tenant[]>;
}

export interface ISuperAdminUserRepository extends IRepository<SuperAdminUser, SuperAdminId> {
  findByEmail(email: string): Promise<SuperAdminUser | null>;
}

export interface IPlatformTicketRepository extends IRepository<PlatformTicket, TicketId> {
  findByTenantCode(tenantCode: string): Promise<PlatformTicket[]>;
  findOpenCriticalTickets(): Promise<PlatformTicket[]>;
}

export interface IPlatformConfigRepository {
  getConfig(): Promise<PlatformConfig>;
  save(config: PlatformConfig): Promise<void>;
}

export interface IPlatformAuditRepository {
  append(log: PlatformAuditLog): Promise<void>;
  getRecentLogs(limit: number): Promise<PlatformAuditLog[]>;
}
```

---

### 5.2 Public Module Facade (`src/modules/super-admin/contracts/super-admin-module.api.ts`)

```typescript
export interface TenantSummaryDto {
  tenantId: string;
  code: string;
  name: string;
  status: string;
  tier: string;
  ownerName: string;
  roomsCount: number;
}

export interface ISuperAdminModuleApi {
  isTenantOperational(tenantCode: string): Promise<boolean>;
  getTenantSummary(tenantCode: string): Promise<TenantSummaryDto | null>;
  isPlatformInMaintenance(): Promise<boolean>;
}
```

```typescript
// src/modules/super-admin/infrastructure/facade/super-admin-module.facade.ts
import { ISuperAdminModuleApi, TenantSummaryDto } from '../../contracts/super-admin-module-api.interface';
import { ITenantRepository } from '../../domain/repositories/tenant.repository.interface';
import { IPlatformConfigRepository } from '../../domain/repositories/platform-config.repository.interface';
import { TenantStatus } from '../../domain/enums/tenant-status.enum';

export class SuperAdminModuleFacade implements ISuperAdminModuleApi {
  public constructor(
    private readonly tenantRepo: ITenantRepository,
    private readonly configRepo: IPlatformConfigRepository
  ) {}

  public async isTenantOperational(tenantCode: string): Promise<boolean> {
    const isMaintenance = await this.isPlatformInMaintenance();
    if (isMaintenance) return false;

    const tenant = await this.tenantRepo.findByCode(tenantCode);
    return tenant ? tenant.status === TenantStatus.ACTIVE : false;
  }

  public async getTenantSummary(tenantCode: string): Promise<TenantSummaryDto | null> {
    const tenant = await this.tenantRepo.findByCode(tenantCode);
    if (!tenant) return null;

    return {
      tenantId: tenant.id.value,
      code: tenant.code,
      name: tenant.name,
      status: tenant.status,
      tier: tenant.tier,
      ownerName: tenant.owner.ownerName,
      roomsCount: tenant.roomsCount
    };
  }

  public async isPlatformInMaintenance(): Promise<boolean> {
    const config = await this.configRepo.getConfig();
    return config.maintenanceMode;
  }
}
```
