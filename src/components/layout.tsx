import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  BedDouble,
  Users,
  ClipboardList,
  Sparkles,
  CreditCard,
  MessageSquare,
  BarChart3,
  Settings2,
  ShieldCheck,
  ScrollText,
  Gift,
  Star,
  UserRound,
  Bell,
  Search,
  ChevronDown,
  ChevronRight,
  Menu as MenuIcon,
  X,
  LogOut,
  ArrowUpRight,
  Palmtree,
  CircleHelp,
  RotateCcw,
  CheckCheck,
  BriefcaseBusiness,
  Crown,
  Leaf,
  Waves,
  ArrowRight,
  Building2,
  LifeBuoy,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { can, roles, shortDate, initials } from '../lib/domain';
import type { Module, Permission, Role } from '../lib/domain';
import { Avatar, Button, Menu, MenuItem, Modal, Confirm, Badge, Empty } from './ui';
type Item = {
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: Permission;
  section?: string;
};
const general: Item[] = [
  { path: 'dashboard', label: 'Overview', icon: LayoutDashboard, section: 'WORKSPACE' },
  { path: 'reservations', label: 'Reservations', icon: CalendarDays, permission: 'reservations' },
  { path: 'rooms', label: 'Rooms & availability', icon: BedDouble, permission: 'rooms' },
  { path: 'amenities', label: 'Amenities', icon: Waves, permission: 'amenities' },
  { path: 'guests', label: 'Guest directory', icon: Users, permission: 'guests' },
  {
    path: 'tasks',
    label: 'Tasks & housekeeping',
    icon: ClipboardList,
    permission: 'tasks',
    section: 'OPERATIONS',
  },
  { path: 'services', label: 'Guest services', icon: Sparkles, permission: 'services' },
  { path: 'team', label: 'Team & shifts', icon: BriefcaseBusiness, permission: 'team' },
  { path: 'support', label: 'Requests & feedback', icon: MessageSquare, permission: 'support' },
  {
    path: 'billing',
    label: 'Billing & payments',
    icon: CreditCard,
    permission: 'billing',
    section: 'BUSINESS',
  },
  { path: 'promotions', label: 'Offers & packages', icon: Gift, permission: 'promotions' },
  { path: 'reports', label: 'Reports & insights', icon: BarChart3, permission: 'reports' },
  { path: 'settings', label: 'Resort settings', icon: Settings2, permission: 'settings' },
];
const guest: Item[] = [
  { path: 'dashboard', label: 'My stay', icon: LayoutDashboard, section: 'YOUR RESORT EXPERIENCE' },
  { path: 'reservations', label: 'My bookings', icon: CalendarDays },
  { path: 'amenities', label: 'Resort amenities', icon: Waves, permission: 'amenities' },
  { path: 'services', label: 'Services & experiences', icon: Sparkles, permission: 'services' },
  { path: 'billing', label: 'Bills & payments', icon: CreditCard, permission: 'billing' },
  { path: 'loyalty', label: 'Palm rewards', icon: Gift },
  { path: 'reviews', label: 'Reviews & feedback', icon: Star },
  { path: 'support', label: 'Help & requests', icon: MessageSquare, permission: 'support' },
  { path: 'profile', label: 'My profile', icon: UserRound },
];
const owner: Item[] = [
  {
    path: 'dashboard',
    label: 'Executive overview',
    icon: LayoutDashboard,
    section: 'YOUR RESORT AT A GLANCE',
  },
  { path: 'reports', label: 'Reports & insights', icon: BarChart3 },
  { path: 'billing', label: 'Financial overview', icon: CreditCard },
  { path: 'rooms', label: 'Rooms & pricing', icon: BedDouble },
  { path: 'amenities', label: 'Amenities & usage', icon: Waves },
  { path: 'accounts', label: 'Accounts & team', icon: Users, section: 'RESORT ADMINISTRATION' },
  { path: 'permissions', label: 'Roles & permissions', icon: ShieldCheck },
  { path: 'audit', label: 'Audit & activity', icon: ScrollText },
  { path: 'settings', label: 'Resort & system settings', icon: Settings2 },
];
const superAdminNav: Item[] = [
  {
    path: 'dashboard',
    label: 'Platform Overview',
    icon: LayoutDashboard,
    section: 'PLATFORM GOVERNANCE',
  },
  { path: 'tenants', label: 'Resorts & Tenants', icon: Building2 },
  { path: 'owners', label: 'Owner Accounts', icon: Users },
  {
    path: 'tickets',
    label: 'Support & Workflow',
    icon: MessageSquare,
    section: 'OPERATIONS & INCIDENTS',
  },
  { path: 'config', label: 'Platform Config', icon: Settings2 },
  { path: 'audit', label: 'Platform Audit Logs', icon: ScrollText },
  { path: 'monitoring', label: 'System Monitoring', icon: BarChart3 },
];
export const moduleIcons = {
  Guest: Palmtree,
  Management: BriefcaseBusiness,
  Staff: Leaf,
  Owner: Crown,
  SuperAdmin: ShieldCheck,
};
export function Layout() {
  const { s, actor, switchDemo, logout, act, reset } = useStore();
  const searchRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        (event.key === '/' || ((event.ctrlKey || event.metaKey) && event.key === 'k')) &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) &&
        !target.isContentEditable
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  const [mobile, setMobile] = useState(false),
    [notifications, setNotifications] = useState(false),
    [resetOpen, setResetOpen] = useState(false),
    [help, setHelp] = useState(false),
    [search, setSearch] = useState(''),
    [searchOpen, setSearchOpen] = useState(false),
    [searchIndex, setSearchIndex] = useState(0);
  const [tenantSupportOpen, setTenantSupportOpen] = useState(true);
  const location = useLocation(),
    navigate = useNavigate();
  useEffect(() => {
    if (location.search.includes('ticket=')) {
      setTenantSupportOpen(true);
    }
  }, [location.search]);
  useEffect(() => {
    setSearch('');
    setSearchOpen(false);
    setMobile(false);
  }, [location.pathname, actor?.id]);
  useEffect(() => {
    if (!mobile) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebarRef.current?.querySelector<HTMLButtonElement>('.mobile-close')?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobile(false);
      if (event.key !== 'Tab') return;
      const focusable = Array.from(
        sidebarRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), select, [tabindex="0"]',
        ) ?? [],
      ).filter((node) => node.getClientRects().length);
      const first = focusable[0],
        last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    const desktop = window.matchMedia('(min-width: 801px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setMobile(false);
    };
    desktop.addEventListener('change', closeOnDesktop);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', handleKey);
      desktop.removeEventListener('change', closeOnDesktop);
      previous?.focus();
    };
  }, [mobile]);
  useEffect(() => {
    document.documentElement.dataset.bgIntensity = 'vivid';
  }, []);
  if (!actor) return <Navigate to="/login" replace />;
  const base = `/${actor.module.toLowerCase()}`;
  const nav = (
    actor.module === 'Guest'
      ? guest
      : actor.module === 'Owner'
        ? owner
        : actor.module === 'SuperAdmin'
          ? superAdminNav
          : general
  ).filter((i) => !i.permission || can(s, actor, i.permission));
  const current = nav.find((x) => location.pathname.startsWith(`${base}/${x.path}`));
  const notices = s.notifications.filter((n) =>
    ['all', actor.id, actor.role, actor.module, actor.guestId].includes(n.audience),
  );
  const unread = notices.filter((n) => !n.readBy.includes(actor.id)).length;
  const switchModule = (m: Module, role?: Role) => {
    if (switchDemo(m, role)) {
      navigate(`/${m.toLowerCase()}/dashboard`);
      setMobile(false);
    }
  };
  const results = search.trim()
    ? nav.filter((i) => i.label.toLowerCase().includes(search.trim().toLowerCase()))
    : [];
  const activeOwnerTicketsCount =
    actor.module === 'Owner'
      ? (s.platformTickets ?? []).filter((t) => {
          const matchesOwner =
            t.creatorId === actor.id ||
            t.ownerEmail === actor.email ||
            t.tenantCode === (actor.tenantId || 'PALM');
          return matchesOwner && t.status !== 'CLOSED';
        }).length
      : 0;
  const handleCreateTicket = () => {
    setMobile(false);
    navigate('/owner/dashboard?ticket=create');
    window.dispatchEvent(new CustomEvent('rrms-open-ticket', { detail: 'create' }));
  };
  const handleMyTickets = () => {
    setMobile(false);
    navigate('/owner/dashboard?ticket=my-tickets');
    window.dispatchEvent(new CustomEvent('rrms-open-ticket', { detail: 'my-tickets' }));
  };
  return (
    <div className={`app-shell theme-${actor.module.toLowerCase()}`}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      {mobile && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        ref={sidebarRef}
        id="workspace-navigation"
        className={`sidebar ${mobile ? 'sidebar-open' : ''}`}
        role={mobile ? 'dialog' : undefined}
        aria-modal={mobile || undefined}
        aria-label={mobile ? 'Workspace navigation' : undefined}
      >
        <Link to={`${base}/dashboard`} className="brand" onClick={() => setMobile(false)}>
          <span className="brand-mark">
            <Palmtree size={26} />
          </span>
          <span>
            rrms<span className="brand-dot">.</span>
            <small>HOSPITALITY, CONNECTED</small>
          </span>
        </Link>
        <button
          className="mobile-close"
          onClick={() => setMobile(false)}
          aria-label="Close navigation"
        >
          <X size={20} />
        </button>
        <Menu
          trigger={
            <button className="resort-switch">
              <div className="resort-thumb">
                <Palmtree size={19} />
              </div>
              <span>
                <strong>{s.policies.resortName}</strong>
                <small>{s.policies.location.split('·')[0]}</small>
              </span>
              <ChevronDown size={14} />
            </button>
          }
        >
          <div className="menu-label">DEMO WORKSPACES</div>
          {(['SuperAdmin', 'Owner', 'Management', 'Staff', 'Guest'] as Module[]).map((m) => {
            const Icon = moduleIcons[m];
            return (
              <MenuItem key={m} onSelect={() => switchModule(m)}>
                <Icon size={16} />
                <span>{m === 'SuperAdmin' ? 'Super Admin' : m}</span>
                {actor.module === m && <span className="ml-auto">✓</span>}
              </MenuItem>
            );
          })}
        </Menu>
        <div className="workspace-chip">
          <span />
          {actor.module === 'SuperAdmin'
            ? 'SuperAdmin (Platform)'
            : `${actor.module} workspace`}
          {actor.module === 'Staff' && <small> · {actor.role}</small>}
          {actor.module === 'SuperAdmin' && <small> · tenantId: null</small>}
        </div>
        <nav className="nav-list" aria-label="Main navigation">
          {nav.map((item, i) => {
            const Icon = item.icon;
            const count =
              actor.module === 'SuperAdmin' && item.path === 'tickets'
                ? s.platformTickets?.filter((t) => t.status !== 'RESOLVED').length ?? 0
                : item.path === 'support'
                  ? s.complaints.filter(
                      (c) =>
                        c.status === 'Open' &&
                        (actor.module !== 'Guest' || c.guestId === actor.guestId),
                    ).length
                  : item.path === 'tasks'
                    ? s.tasks.filter(
                        (t) =>
                          t.status === 'Pending' &&
                          (actor.module !== 'Staff' || t.assignee === actor.id),
                      ).length
                    : 0;
            return (
              <div key={item.path}>
                {(item.section || i === 0) && (
                  <div className="nav-section">{item.section ?? 'MY WORKSPACE'}</div>
                )}
                <NavLink
                  to={`${base}/${item.path}`}
                  onClick={() => setMobile(false)}
                  className={({ isActive }) => `nav-item ${isActive ? 'nav-active' : ''}`}
                >
                  <Icon size={18} />
                  <span>
                    {actor.module === 'Staff' && item.path === 'tasks' ? 'My tasks' : item.label}
                  </span>
                  {count > 0 && <small className="nav-count">{count}</small>}
                </NavLink>
              </div>
            );
          })}
          {actor.module === 'Owner' && (
            <div className="tenant-support-section mt-1">
              <div className="nav-section">SUPPORT & ESCALATIONS</div>
              <button
                type="button"
                id="owner-tenant-support-toggle"
                onClick={() => setTenantSupportOpen(!tenantSupportOpen)}
                className={`nav-item w-full text-left cursor-pointer flex items-center justify-between ${
                  location.search.includes('ticket=') ? 'nav-active' : ''
                }`}
                aria-expanded={tenantSupportOpen}
                aria-controls="tenant-support-submenu"
              >
                <div className="flex items-center gap-2.5">
                  <LifeBuoy size={18} />
                  <span>Tenant Support</span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  {activeOwnerTicketsCount > 0 && (
                    <small className="nav-count">{activeOwnerTicketsCount}</small>
                  )}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      tenantSupportOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>
              {tenantSupportOpen && (
                <div
                  id="tenant-support-submenu"
                  className="border-l border-white/10 ml-4 pl-2 space-y-0.5 mt-0.5"
                >
                  <button
                    type="button"
                    id="owner-create-ticket-btn"
                    onClick={handleCreateTicket}
                    className={`nav-item w-full text-left cursor-pointer flex items-center gap-2 text-xs py-2 px-2.5 ${
                      location.pathname.includes('/owner/dashboard') &&
                      location.search.includes('ticket=create')
                        ? 'nav-active'
                        : ''
                    }`}
                    style={{ minHeight: '36px' }}
                  >
                    <LifeBuoy size={15} className="text-[#C9A227] shrink-0" />
                    <span>Create Ticket</span>
                  </button>
                  <button
                    type="button"
                    id="owner-my-tickets-btn"
                    onClick={handleMyTickets}
                    className={`nav-item w-full text-left cursor-pointer flex items-center justify-between text-xs py-2 px-2.5 ${
                      location.pathname.includes('/owner/dashboard') &&
                      (location.search.includes('ticket=my-tickets') ||
                        location.search.includes('ticket=view'))
                        ? 'nav-active'
                        : ''
                    }`}
                    style={{ minHeight: '36px' }}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare size={15} className="shrink-0" />
                      <span>My Tickets</span>
                    </div>
                    {activeOwnerTicketsCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-[#C9A227] text-white font-bold text-[10px] rounded-full">
                        {activeOwnerTicketsCount}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
          {actor.module === 'SuperAdmin' && (
            <div className="superadmin-help-section mt-3 pt-2 border-t border-white/10">
              <button
                type="button"
                id="superadmin-help-button"
                className="nav-item w-full text-left cursor-pointer flex items-center justify-between"
                onClick={() => setHelp(true)}
              >
                <div className="flex items-center gap-2.5">
                  <CircleHelp size={18} />
                  <span>Help & getting started</span>
                </div>
                <ArrowUpRight size={14} className="opacity-70" />
              </button>
            </div>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-footer">
            <span className="live-dot" /> All systems operational <span>v1.0</span>
          </div>
        </div>
      </aside>
      <div className="main-shell" inert={mobile || undefined}>
        <header className="topbar">
          <div className="topbar-left">
            <Button
              variant="ghost"
              size="icon"
              className="mobile-toggle"
              onClick={() => setMobile(true)}
              aria-label="Open navigation"
              aria-expanded={mobile}
              aria-controls="workspace-navigation"
            >
              <MenuIcon size={22} />
            </Button>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link to={`${base}/dashboard`}>{actor.module}</Link>
              <ChevronRight size={13} className="crumb-sep" aria-hidden="true" />
              <Link
                to={`${base}/${current?.path ?? 'dashboard'}`}
                className={location.pathname.split('/').length <= 3 ? 'crumb-active' : ''}
                aria-current={location.pathname.split('/').length <= 3 ? 'page' : undefined}
              >
                {current?.label ?? 'Overview'}
              </Link>
              {location.pathname.split('/').length > 3 && (
                <>
                  <ChevronRight size={13} className="crumb-sep" aria-hidden="true" />
                  <span className="crumb-active" aria-current="page">
                    {location.search.includes('new=1')
                      ? 'New Reservation'
                      : location.pathname.includes('accounts')
                        ? 'Account Creation'
                        : 'Details'}
                  </span>
                </>
              )}
            </nav>
          </div>
          <div className="topbar-actions">
            <div
              className="global-search"
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setSearchOpen(false);
              }}
            >
              <Search size={16} />
              <input
                ref={searchRef}
                aria-label="Search workspace"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={searchOpen && Boolean(search.trim())}
                aria-controls={searchOpen && search.trim() ? 'workspace-search-results' : undefined}
                aria-activedescendant={
                  searchOpen && results[searchIndex]
                    ? `workspace-result-${results[searchIndex].path}`
                    : undefined
                }
                placeholder="Search your workspace…"
                value={search}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSearchOpen(true);
                  setSearchIndex(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchOpen(false);
                    e.stopPropagation();
                  }
                  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSearchOpen(true);
                    setSearchIndex((index) =>
                      results.length
                        ? (index + (e.key === 'ArrowDown' ? 1 : -1) + results.length) %
                          results.length
                        : 0,
                    );
                  }
                  if (e.key === 'Enter' && searchOpen && results[searchIndex]) {
                    e.preventDefault();
                    navigate(`${base}/${results[searchIndex].path}`);
                    setSearch('');
                    setSearchOpen(false);
                  }
                }}
              />
              <kbd>/</kbd>
              {search.trim() && searchOpen && (
                <div
                  className="search-results"
                  id="workspace-search-results"
                  role="listbox"
                  aria-label="Matching screens"
                >
                  {results.length ? (
                    results.map((r, index) => (
                      <button
                        key={r.path}
                        id={`workspace-result-${r.path}`}
                        role="option"
                        aria-selected={searchIndex === index}
                        onMouseEnter={() => setSearchIndex(index)}
                        onClick={() => {
                          navigate(`${base}/${r.path}`);
                          setSearch('');
                          setSearchOpen(false);
                        }}
                      >
                        <r.icon size={16} />
                        {r.label}
                        <ArrowRight size={14} />
                      </button>
                    ))
                  ) : (
                    <p>No screens match “{search}”.</p>
                  )}
                </div>
              )}
            </div>
            <span className="topbar-divider" />
            <Button
              variant="ghost"
              size="icon"
              className="notification-button"
              onClick={() => setNotifications(true)}
              aria-label={`Notifications, ${unread} unread`}
            >
              <Bell size={19} />
              {unread > 0 && <i />}
            </Button>
            <Menu
              trigger={
                <button className="profile-trigger" aria-label="Open profile menu">
                  <Avatar name={actor.name} size="small" />
                  <div>
                    <strong>{actor.name}</strong>
                    <small>
                      {actor.module === 'Staff'
                        ? actor.role
                        : actor.module === 'Guest'
                          ? 'Palm member'
                          : 'Resort ' + actor.module.toLowerCase()}
                    </small>
                  </div>
                  <ChevronDown size={14} />
                </button>
              }
            >
              <div className="menu-label">{actor.email}</div>
              {actor.module === 'Guest' && (
                <MenuItem onSelect={() => navigate(`${base}/profile`)}>
                  <UserRound size={16} />
                  My profile
                </MenuItem>
              )}
              {actor.module === 'SuperAdmin' && (
                <MenuItem onSelect={() => setHelp(true)}>
                  <CircleHelp size={16} />
                  Demo accounts & guide
                </MenuItem>
              )}
              <MenuItem onSelect={() => setResetOpen(true)}>
                <RotateCcw size={16} />
                Reset demo data
              </MenuItem>
              <MenuItem
                onSelect={() => {
                  logout();
                  navigate('/login');
                }}
              >
                <LogOut size={16} />
                Sign out
              </MenuItem>
            </Menu>
          </div>
        </header>

        <main id="main-content" className="main-content" tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>
            © {new Date().getFullYear()} {s.policies.resortName} · Powered by RRMS
          </span>
          <span>
            <span className="live-dot" /> Changes saved on this device
          </span>
        </footer>
      </div>
      {notifications && (
        <Modal
          open
          onClose={() => setNotifications(false)}
          title="Your notifications"
          description={`${unread} unread updates from around the resort.`}
        >
          <div className="dialog-body notification-list">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                act({ type: 'notifications.read' }, 'All notifications marked as read')
              }
            >
              <CheckCheck size={16} />
              Mark all as read
            </Button>
            {notices.length ? (
              notices.map((n) => (
                <button
                  key={n.id}
                  className={`notification-row ${n.readBy.includes(actor.id) ? '' : 'unread'}`}
                  onClick={() => act({ type: 'notifications.read', payload: { id: n.id } }, '')}
                >
                  <span className="notification-icon">
                    <Bell size={17} />
                  </span>
                  <span>
                    <strong>{n.title}</strong>
                    <p>{n.message}</p>
                    <small>{shortDate(n.date)}</small>
                  </span>
                  {!n.readBy.includes(actor.id) && <span className="unread-dot" />}
                </button>
              ))
            ) : (
              <Empty title="You're all caught up" />
            )}
          </div>
        </Modal>
      )}
      {resetOpen && (
        <Confirm
          title="Reset the demo workspace?"
          description="This removes changes made on this device and restores all seeded resort records. This action cannot be undone."
          label="Reset demo data"
          onClose={() => setResetOpen(false)}
          onConfirm={() => {
            reset();
            navigate('/management/dashboard');
            return true;
          }}
        />
      )}
      {help && actor.module === 'SuperAdmin' && (
        <Modal
          open
          wide
          onClose={() => setHelp(false)}
          title="One resort. Every perspective."
          description="Explore the connected demo using the workspace switcher. All payments, credentials, uploads and messages are simulated."
        >
          <div className="dialog-body max-h-[75vh] overflow-y-auto">
            <div className="info-box">
              Try the full journey: confirm a reservation → sign in as its guest → check in →
              request and complete a service → settle the bill → check out → leave a review.
            </div>
            <h3 className="section-title">Demo credentials</h3>
            <p className="muted">
              All seeded accounts use <code>Resort@123</code>. Owner changes to accounts and
              permissions take effect immediately.
            </p>
            <div className="credentials-grid">
              {s.accounts
                .filter(
                  (x) => ['manager', 'owner', 'account-G1'].includes(x.id) || /^A[1-7]$/.test(x.id),
                )
                .map((a) => (
                  <div key={a.id}>
                    <strong>{a.module === 'Staff' ? a.role : a.module}</strong>
                    <code>{a.email}</code>
                  </div>
                ))}
            </div>
            <p className="muted">
              Reception issues credentials after a confirmed booking. Guest room discovery and
              advance payments happen outside RRMS. Room readiness requires management inspection;
              check-out requires a settled folio and completed services.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setHelp(false);
                setResetOpen(true);
              }}
            >
              <RotateCcw size={16} />
              Reset demo data
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
