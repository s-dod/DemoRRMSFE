# RRMS Modular Monolith Architecture & Domain Specifications

This directory contains the modular architecture documents for the Resort & Restaurant Management System (RRMS), separated into dedicated specifications:

---

## Architecture Documents Index

1. **[GENERIC_CLASSES.md](file:///c:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsFE-testingENV/GENERIC_CLASSES.md)**
   - **Shared Kernel & Generic Classes (Full TypeScript Code)**
   - Base primitives: `BaseEntity<TId>`, `AuditableEntity<TId>`, `SoftDeletableEntity<TId>`, `AggregateRoot<TId>`, `ValueObject<TProps>`
   - Functional envelopes: `Result<T, E>`, `AppError`
   - Common Value Objects: `Money`, `Email`, `Address`, `DateRange`
   - Application contracts: `IRepository<T>`, `IUnitOfWork`, `PagedResult<T>`, `IEventBus`, `InMemoryEventBus`, `OutboxMessage`

2. **[SUPER_ADMIN_MODULE_ENTITIES.md](file:///c:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsFE-testingENV/SUPER_ADMIN_MODULE_ENTITIES.md)**
   - **Super Admin Module (Full TypeScript Code)**
   - Platform boundary rule (`tenantId: null`)
   - Aggregate Roots: `Tenant` (Resort Shards), `SuperAdminUser` (MFA & Platform Auth), `PlatformTicket` (Technical Support Escalations), `PlatformConfig` (Global Cluster Configuration)
   - Entities: `TicketReply`, `TicketAttachment`, `TicketHistoryEntry`, `PlatformAuditLog`, `SystemTelemetrySnapshot`
   - Value Objects: `TenantId`, `TicketId`, `SuperAdminId`, `TenantOwnerInfo`
   - Enums: `TenantStatus`, `SubscriptionTier`, `TicketPriority`, `TicketStatus`, `TicketCategory`, `PlatformAuditSeverity`
   - Domain Events: `TenantProvisionedEvent`, `TenantStatusChangedEvent`, `TicketEscalatedEvent`, `MaintenanceModeToggledEvent`
   - Repositories & Facade: `ITenantRepository`, `ISuperAdminUserRepository`, `IPlatformTicketRepository`, `IPlatformConfigRepository`, `ISuperAdminModuleApi`

3. **[OWNER_MODULE_ENTITIES.md](file:///c:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsFE-testingENV/OWNER_MODULE_ENTITIES.md)**
   - **Owner Module Specification**
   - Aggregate Roots: `Owner`, `ResortProperty`
   - Entities: `PropertyPolicy`, `Department`, `RevenueTarget`, `ExecutiveAuditLog`
   - Value Objects: `OwnerId`, `PropertyId`, `TaxInfo`, `OperatingHours`
   - Enums: `OwnershipType`, `OwnerStatus`, `PropertyOperationalStatus`
   - Repositories & Facade: `IOwnerRepository`, `IResortPropertyRepository`, `IOwnerModuleApi`

4. **[GUEST_MODULE_ENTITIES.md](file:///c:/Users/USER/Desktop/Resort/SUPER%20ADMIN/rmsFE-testingENV/GUEST_MODULE_ENTITIES.md)**
   - **Guest Module Specification**
   - Aggregate Roots: `Guest`, `LoyaltyAccount`, `ServiceRequest`
   - Entities: `LoyaltyTransaction`, `GuestFeedback`
   - Value Objects: `GuestId`, `IdentificationDocument`, `GuestPreferences`
   - Enums: `GuestVipStatus`, `LoyaltyTier`, `IdDocumentType`, `ServiceCategory`, `ServicePriority`, `ServiceStatus`
   - Repositories & Facade: `IGuestRepository`, `ILoyaltyAccountRepository`, `IServiceRequestRepository`, `IGuestModuleApi`
