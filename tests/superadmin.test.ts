import { describe, it, expect, beforeEach } from 'vitest';
import {
  seed,
  applyCommand,
  can,
  type State,
} from '../src/lib/domain';

let s: State;

describe('Super Admin Domain & Role Boundaries', () => {
  beforeEach(() => {
    s = seed();
  });

  it('initializes Super Admin with tenantId=null and platform state', () => {
    const admin = s.accounts.find((a) => a.module === 'SuperAdmin');
    expect(admin).toBeDefined();
    expect(admin?.role).toBe('SUPER_ADMIN');
    expect(admin?.tenantId).toBeNull();

    expect(s.tenants).toBeDefined();
    expect(s.tenants?.length).toBeGreaterThanOrEqual(4);
    expect(s.platformTickets).toBeDefined();
    expect(s.platformTickets?.length).toBeGreaterThanOrEqual(5);
    expect(s.platformConfig).toBeDefined();
    expect(s.platformAudit).toBeDefined();
  });

  it('enforces role boundaries: Super Admin cannot have tenant permissions', () => {
    const admin = s.accounts.find((a) => a.module === 'SuperAdmin')!;
    expect(can(s, admin, 'rooms')).toBe(false);
    expect(can(s, admin, 'reservations')).toBe(false);
    expect(can(s, admin, 'tasks')).toBe(false);
    expect(can(s, admin, 'billing')).toBe(false);
    expect(can(s, admin, 'reports')).toBe(false);
  });

  it('strictly blocks Super Admin from executing tenant-level commands', () => {
    const admin = s.accounts.find((a) => a.module === 'SuperAdmin')!;

    expect(() => {
      applyCommand(s, admin.id, {
        type: 'room.update',
        payload: { id: 'R1', rate: 5000 },
      });
    }).toThrow(/Super Admin operates at platform level/i);

    expect(() => {
      applyCommand(s, admin.id, {
        type: 'reservation.create',
        payload: { roomId: 'R1' },
      });
    }).toThrow(/Super Admin operates at platform level/i);
  });

  it('provisions tenant and owner account together in an atomic command', () => {
    const admin = s.accounts.find((a) => a.module === 'SuperAdmin')!;
    const previousTenantCount = s.tenants?.length ?? 0;
    const previousAccountCount = s.accounts.length;

    s = applyCommand(s, admin.id, {
      type: 'superadmin.tenant.create',
      payload: {
        code: 'SUNSET',
        name: 'Sunset Dunes Luxury Retreat',
        ownerName: 'Kabir Singhania',
        ownerEmail: 'kabir@sunset.demo',
        password: 'Sunset@123',
        tier: 'Enterprise',
        location: 'Jaisalmer, Rajasthan · India',
        roomsCount: 32,
      },
    });

    expect(s.tenants?.length).toBe(previousTenantCount + 1);
    expect(s.accounts.length).toBe(previousAccountCount + 1);

    const createdTenant = s.tenants?.find((t) => t.code === 'SUNSET');
    expect(createdTenant).toBeDefined();
    expect(createdTenant?.name).toBe('Sunset Dunes Luxury Retreat');
    expect(createdTenant?.ownerEmail).toBe('kabir@sunset.demo');
    expect(createdTenant?.status).toBe('Active');

    const createdOwner = s.accounts.find((a) => a.email === 'kabir@sunset.demo');
    expect(createdOwner).toBeDefined();
    expect(createdOwner?.name).toBe('Kabir Singhania');
    expect(createdOwner?.module).toBe('Owner');
    expect(createdOwner?.tenantId).toBe('SUNSET');

    // Platform audit entry verified
    const auditEntry = s.platformAudit?.find(
      (a) => a.action === 'TENANT_PROVISIONED' && a.tenantCode === 'SUNSET',
    );
    expect(auditEntry).toBeDefined();
  });

  it('updates tenant details and logs platform audit event', () => {
    const admin = s.accounts.find((a) => a.module === 'SuperAdmin')!;
    s = applyCommand(s, admin.id, {
      type: 'superadmin.tenant.update',
      payload: {
        code: 'PALM',
        name: 'The Palm Ultra Luxury Resort',
        status: 'Active',
        tier: 'Enterprise Plus',
        roomsCount: 45,
      },
    });

    const palm = s.tenants?.find((t) => t.code === 'PALM');
    expect(palm?.name).toBe('The Palm Ultra Luxury Resort');
    expect(palm?.tier).toBe('Enterprise Plus');
    expect(palm?.roomsCount).toBe(45);

    const auditEntry = s.platformAudit?.find(
      (a) => a.action === 'TENANT_UPDATED' && a.tenantCode === 'PALM',
    );
    expect(auditEntry).toBeDefined();
  });

  it('manages and updates owner accounts and credentials', () => {
    const admin = s.accounts.find((a) => a.module === 'SuperAdmin')!;
    s = applyCommand(s, admin.id, {
      type: 'superadmin.owner.update',
      payload: {
        id: 'owner',
        name: 'Vikram Oberoi (Updated)',
        password: 'NewResortPass@123',
        active: false,
      },
    });

    const owner = s.accounts.find((a) => a.id === 'owner');
    expect(owner?.name).toBe('Vikram Oberoi (Updated)');
    expect(owner?.password).toBe('NewResortPass@123');
    expect(owner?.active).toBe(false);

    const auditEntry = s.platformAudit?.find((a) => a.action === 'OWNER_ACCOUNT_UPDATED');
    expect(auditEntry).toBeDefined();
  });

  it('updates support ticket status and resolution notes', () => {
    const admin = s.accounts.find((a) => a.module === 'SuperAdmin')!;
    s = applyCommand(s, admin.id, {
      type: 'superadmin.ticket.update',
      payload: {
        id: 'TK-101',
        status: 'RESOLVED',
        resolutionNotes: 'Deployed Redis connection pool optimization to resolve timeout.',
      },
    });

    const ticket = s.platformTickets?.find((t) => t.id === 'TK-101');
    expect(ticket?.status).toBe('RESOLVED');
    expect(ticket?.resolutionNotes).toContain('Redis connection pool');

    const auditEntry = s.platformAudit?.find(
      (a) => a.action === 'TICKET_UPDATED' && a.tenantCode === 'PALM',
    );
    expect(auditEntry).toBeDefined();
  });

  it('creates new support incident ticket', () => {
    const admin = s.accounts.find((a) => a.module === 'SuperAdmin')!;
    s = applyCommand(s, admin.id, {
      type: 'superadmin.ticket.create',
      payload: {
        tenantCode: 'AZURE',
        title: 'SMS Gateway delivery failure on check-in',
        category: 'INTEGRATIONS',
        priority: 'MEDIUM',
        description: 'Twilio SMS webhooks returned 401 unauthorized due to rotated key.',
      },
    });

    const ticket = s.platformTickets?.find(
      (t) => t.title === 'SMS Gateway delivery failure on check-in',
    );
    expect(ticket).toBeDefined();
    expect(ticket?.tenantCode).toBe('AZURE');
    expect(ticket?.priority).toBe('MEDIUM');
    expect(ticket?.status).toBe('OPEN');
  });

  it('updates platform configuration and toggles maintenance mode', () => {
    const admin = s.accounts.find((a) => a.module === 'SuperAdmin')!;
    s = applyCommand(s, admin.id, {
      type: 'superadmin.config.update',
      payload: {
        maxTenants: 75,
        sessionTimeoutMinutes: 90,
      },
    });

    expect(s.platformConfig?.maxTenants).toBe(75);
    expect(s.platformConfig?.sessionTimeoutMinutes).toBe(90);

    const prevMaintenance = s.platformConfig?.maintenanceMode;
    s = applyCommand(s, admin.id, {
      type: 'superadmin.maintenance.toggle',
    });
    expect(s.platformConfig?.maintenanceMode).toBe(!prevMaintenance);
  });
});
