import { describe, it, expect, beforeEach } from 'vitest';
import { seed, applyCommand, type State } from '../src/lib/domain';

let s: State;

describe('Owner Ticket Creation & Super Admin Lifecycle', () => {
  beforeEach(() => {
    s = seed();
  });

  it('allows Owner to create a support ticket with auto-identification and Super Admin assignment', () => {
    const owner = s.accounts.find((a) => a.module === 'Owner')!;
    expect(owner).toBeDefined();

    const prevTicketCount = s.platformTickets?.length ?? 0;
    const prevNotifCount = s.notifications.length;

    s = applyCommand(s, owner.id, {
      type: 'ticket.create',
      payload: {
        title: 'POS card terminal terminal error on beach bar checkout',
        category: 'Bug/Error',
        description: 'Verifone terminal at Cabana Bar reports error code 502 during contactless payments.',
        priority: 'HIGH',
        attachments: [
          {
            id: 'att-1',
            name: 'terminal_error_screenshot.png',
            type: 'image/png',
            size: 154000,
            dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          },
        ],
      },
    });

    expect(s.platformTickets?.length).toBe(prevTicketCount + 1);

    const created = s.platformTickets?.find(
      (t) => t.title === 'POS card terminal terminal error on beach bar checkout',
    );
    expect(created).toBeDefined();
    expect(created?.id).toMatch(/^TK-/);
    expect(created?.status).toBe('OPEN');
    expect(created?.category).toBe('Bug/Error');
    expect(created?.priority).toBe('HIGH');
    expect(created?.creatorId).toBe(owner.id);
    expect(created?.ownerName).toBe(owner.name);
    expect(created?.ownerEmail).toBe(owner.email);
    expect(created?.tenantCode).toBe(owner.tenantId || 'PALM');

    // Auto-assigned to Super Admin
    expect(created?.assigneeId).toBe('superadmin');
    expect(created?.assigneeEmail).toBe('admin@rrms.demo');

    // Attachments verified
    expect(created?.attachments?.length).toBe(1);
    expect(created?.attachments?.[0].name).toBe('terminal_error_screenshot.png');

    // History initialized
    expect(created?.history?.length).toBeGreaterThanOrEqual(1);
    expect(created?.history?.[0].action).toBe('TICKET_CREATED');

    // Super Admin notified
    expect(s.notifications.length).toBe(prevNotifCount + 1);
    const superAdminNotif = s.notifications.find(
      (n) => n.audience === 'SUPER_ADMIN' && n.title.includes(created!.id),
    );
    expect(superAdminNotif).toBeDefined();
    expect(superAdminNotif?.message).toContain(owner.name);
  });

  it('supports full lifecycle through CLOSED and bidirectional replies with notifications', () => {
    const owner = s.accounts.find((a) => a.module === 'Owner')!;
    const admin = s.accounts.find((a) => a.module === 'SuperAdmin')!;

    // 1. Owner creates ticket
    s = applyCommand(s, owner.id, {
      type: 'ticket.create',
      payload: {
        title: 'OTA inventory rate parity mismatch',
        category: 'Data Correction',
        description: 'Deluxe Suite rates on Expedia show 15% discount not configured in rate master.',
        priority: 'MEDIUM',
      },
    });

    const ticket = s.platformTickets?.[0]!;
    expect(ticket.status).toBe('OPEN');

    // 2. Super Admin transitions status to IN_PROGRESS and replies
    s = applyCommand(s, admin.id, {
      type: 'ticket.update',
      payload: {
        id: ticket.id,
        status: 'IN_PROGRESS',
        reply: 'We have paused the Expedia sync adapter while investigating rate parity matrices.',
      },
    });

    let updated = s.platformTickets?.find((t) => t.id === ticket.id)!;
    expect(updated.status).toBe('IN_PROGRESS');
    expect(updated.replies?.length).toBe(1);
    expect(updated.replies?.[0].senderRole).toBe('SUPER_ADMIN');
    expect(updated.replies?.[0].message).toContain('paused the Expedia sync');

    // Owner should be notified of status update and reply
    const ownerNotif = s.notifications.find(
      (n) => (n.audience === owner.id || n.audience === 'Owner') && n.title.includes(ticket.id),
    );
    expect(ownerNotif).toBeDefined();

    // 3. Owner replies back with clarification
    s = applyCommand(s, owner.id, {
      type: 'ticket.update',
      payload: {
        id: ticket.id,
        reply: 'Thank you! Front desk confirmed Expedia holds are paused for now.',
      },
    });

    updated = s.platformTickets?.find((t) => t.id === ticket.id)!;
    expect(updated.replies?.length).toBe(2);
    expect(updated.replies?.[1].senderRole).toBe('Owner');

    // 4. Super Admin resolves and then closes ticket
    s = applyCommand(s, admin.id, {
      type: 'ticket.update',
      payload: {
        id: ticket.id,
        status: 'RESOLVED',
        resolutionNotes: 'Updated channel multiplier rule and cleared stale cache.',
      },
    });

    updated = s.platformTickets?.find((t) => t.id === ticket.id)!;
    expect(updated.status).toBe('RESOLVED');

    s = applyCommand(s, admin.id, {
      type: 'ticket.update',
      payload: {
        id: ticket.id,
        status: 'CLOSED',
      },
    });

    updated = s.platformTickets?.find((t) => t.id === ticket.id)!;
    expect(updated.status).toBe('CLOSED');
    expect(updated.history?.some((h) => h.details?.includes('CLOSED'))).toBe(true);
  });

  it('rejects ticket creation with empty title or description', () => {
    const owner = s.accounts.find((a) => a.module === 'Owner')!;
    expect(() => {
      applyCommand(s, owner.id, {
        type: 'ticket.create',
        payload: {
          title: '',
          category: 'Bug/Error',
          description: 'Valid description',
        },
      });
    }).toThrow();

    expect(() => {
      applyCommand(s, owner.id, {
        type: 'ticket.create',
        payload: {
          title: 'Valid title',
          category: 'Bug/Error',
          description: '',
        },
      });
    }).toThrow();
  });
});
