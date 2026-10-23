import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  LifeBuoy,
  Activity,
  Settings2,
  ScrollText,
  Plus,
  Pencil,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Cpu,
  Database,
  Server,
  CheckCircle2,
  AlertTriangle,
  Flame,
  KeyRound,
  Download,
  Sliders,
  ShieldCheck,
  RotateCcw,
  MapPin,
  Mail,
  User,
  BedDouble,
  Eye,
  EyeOff,
  Lock,
  Paperclip,
  MessageSquare,
  Send,
  FileText,
  ExternalLink,
  History,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../lib/store';
import {
  today,
  dateOffset,
  type Tenant,
  type TenantStatusType,
  type PlatformTicket,
  type TicketAttachment,
  type PlatformConfig,
  type PlatformAuditLog,
  type Account,
} from '../lib/domain';
import {
  Button,
  Card,
  CardHead,
  Badge,
  Modal,
  DataTable,
  PageTitle,
  Empty,
  PageMotion,
} from '../components/ui';
import { downloadCsv } from '../lib/utils';

export default function SuperAdminDashboard() {
  const { page } = useParams<{ page?: string }>();
  const navigate = useNavigate();
  const { s, actor, act } = useStore();

  // Active tab synced with URL route
  const tabList = ['overview', 'tenants', 'owners', 'tickets', 'config', 'audit', 'monitoring'];
  const currentTab = page && tabList.includes(page) ? page : 'overview';
  const setTab = (tab: string) => {
    if (tab === 'overview') navigate('/superadmin/dashboard');
    else navigate(`/superadmin/${tab}`);
  };

  const tenants: Tenant[] = s.tenants ?? [];
  const tickets: PlatformTicket[] = s.platformTickets ?? [];
  const config: PlatformConfig = s.platformConfig ?? {
    maintenanceMode: false,
    registrationOpen: false,
    maxTenants: 50,
    sessionTimeoutMinutes: 60,
    telemetryIntervalSeconds: 30,
    backupSchedule: 'Daily @ 02:00 UTC',
    enforceMfa: false,
    logRetentionDays: 90,
    defaultTimezone: 'Asia/Kolkata (IST)',
  };
  const auditLogs: PlatformAuditLog[] = s.platformAudit ?? [];

  // Provisioning Modal State
  const [createTenantModal, setCreateTenantModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [tenantCode, setTenantCode] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [resortEmail, setResortEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('Resort@123');
  const [tenantTier, setTenantTier] = useState('Enterprise');
  const [tenantLocation, setTenantLocation] = useState('Candolim, Goa · India');
  const [roomsCount, setRoomsCount] = useState(24);

  // Generated Credentials Display Modal
  const [createdCredentials, setCreatedCredentials] = useState<{
    resortName: string;
    tenantCode: string;
    ownerName: string;
    resortEmail: string;
    ownerEmail?: string;
    tempPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Edit Tenant Modal
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [editTenantName, setEditTenantName] = useState('');
  const [editTenantStatus, setEditTenantStatus] = useState<TenantStatusType>('Active');
  const [editTenantTier, setEditTenantTier] = useState('Enterprise');
  const [editTenantLocation, setEditTenantLocation] = useState('');
  const [editTenantRooms, setEditTenantRooms] = useState(24);

  // Manage Owner Modal
  const [editOwner, setEditOwner] = useState<Account | null>(null);
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editOwnerEmail, setEditOwnerEmail] = useState('');
  const [editOwnerPassword, setEditOwnerPassword] = useState('');
  const [editOwnerActive, setEditOwnerActive] = useState(true);

  // Support Ticket Resolution Modal
  const [selectedTicket, setSelectedTicket] = useState<PlatformTicket | null>(null);
  const [ticketStatus, setTicketStatus] = useState<'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>(
    'IN_PROGRESS',
  );
  const [ticketPriority, setTicketPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>(
    'HIGH',
  );
  const [ticketResolution, setTicketResolution] = useState('');
  const [adminReply, setAdminReply] = useState('');
  const [adminReplyAttachments, setAdminReplyAttachments] = useState<TicketAttachment[]>([]);
  const [previewAttachment, setPreviewAttachment] = useState<TicketAttachment | null>(null);

  // Create Ticket Modal
  const [createTicketModal, setCreateTicketModal] = useState(false);
  const [newTicketTenant, setNewTicketTenant] = useState('PALM');
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState('Technical Issue');
  const [newTicketPriority, setNewTicketPriority] = useState<
    'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  >('HIGH');
  const [newTicketDescription, setNewTicketDescription] = useState('');

  // Filters for tickets
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('ALL');
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState<string>('ALL');

  // Platform Config form state
  const [configState, setConfigState] = useState<PlatformConfig>(config);

  // Telemetry refresh simulation
  const [telemetrySyncing, setTelemetrySyncing] = useState(false);

  // Calculate stats
  const ownerAccounts = s.accounts.filter((a) => a.module === 'Owner');
  const openTickets = tickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED');
  const criticalTickets = tickets.filter(
    (t) => t.priority === 'CRITICAL' && t.status !== 'RESOLVED' && t.status !== 'CLOSED',
  );

  // Handle Provisioning Tenant & Owner Together
  const handleCreateTenantAndOwner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantCode.trim() || !tenantName.trim() || !ownerName.trim() || !resortEmail.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const cleanCode = tenantCode.trim().toUpperCase();
    const cleanEmail = resortEmail.trim().toLowerCase();

    const ok = act(
      {
        type: 'superadmin.tenant.create',
        payload: {
          code: cleanCode,
          name: tenantName.trim(),
          ownerName: ownerName.trim(),
          resortEmail: cleanEmail,
          ownerEmail: cleanEmail,
          password: ownerPassword.trim() || 'Resort@123',
          tier: tenantTier,
          location: tenantLocation.trim() || 'Candolim, Goa · India',
          roomsCount: Number(roomsCount) || 24,
        },
      },
      `Provisioned resort "${tenantName}" and created primary Owner account!`,
    );

    if (ok) {
      setCreatedCredentials({
        resortName: tenantName.trim(),
        tenantCode: cleanCode,
        ownerName: ownerName.trim(),
        resortEmail: cleanEmail,
        ownerEmail: cleanEmail,
        tempPassword: ownerPassword.trim() || 'Resort@123',
      });
      setCreateTenantModal(false);
      // Reset form
      setTenantName('');
      setTenantCode('');
      setOwnerName('');
      setResortEmail('');
      setOwnerPassword('Resort@123');
    }
  };

  // Handle Tenant Update
  const handleUpdateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTenant) return;

    const ok = act(
      {
        type: 'superadmin.tenant.update',
        payload: {
          id: editTenant.id,
          code: editTenant.code,
          name: editTenantName.trim(),
          status: editTenantStatus,
          tier: editTenantTier,
          location: editTenantLocation.trim(),
          roomsCount: Number(editTenantRooms),
        },
      },
      `Updated details for resort [${editTenant.code}]`,
    );

    if (ok) setEditTenant(null);
  };

  // Handle Owner Update
  const handleUpdateOwner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOwner) return;

    const ok = act(
      {
        type: 'superadmin.owner.update',
        payload: {
          id: editOwner.id,
          name: editOwnerName.trim(),
          email: editOwnerEmail.trim().toLowerCase(),
          password: editOwnerPassword.trim() || editOwner.password,
          active: editOwnerActive,
        },
      },
      `Owner account ${editOwner.email} updated successfully`,
    );

    if (ok) setEditOwner(null);
  };

  // Handle Ticket Resolution Update
  const handleUpdateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    const ok = act(
      {
        type: 'superadmin.ticket.update',
        payload: {
          id: selectedTicket.id,
          status: ticketStatus,
          priority: ticketPriority,
          resolutionNotes: ticketResolution.trim(),
          reply: adminReply.trim() || undefined,
          replyAttachments: adminReplyAttachments.length ? adminReplyAttachments : undefined,
        },
      },
      `Ticket #${selectedTicket.id} updated to ${ticketStatus}`,
    );

    if (ok) {
      setSelectedTicket(null);
      setTicketResolution('');
      setAdminReply('');
      setAdminReplyAttachments([]);
    }
  };

  // Handle New Ticket Creation
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketTitle.trim() || !newTicketDescription.trim()) {
      toast.error('Please provide a title and detailed issue description.');
      return;
    }

    const ok = act(
      {
        type: 'superadmin.ticket.create',
        payload: {
          tenantCode: newTicketTenant,
          title: newTicketTitle.trim(),
          category: newTicketCategory,
          priority: newTicketPriority,
          description: newTicketDescription.trim(),
        },
      },
      'Technical incident logged successfully',
    );

    if (ok) {
      setCreateTicketModal(false);
      setNewTicketTitle('');
      setNewTicketDescription('');
    }
  };

  // Handle Platform Config Save
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    act(
      {
        type: 'superadmin.config.update',
        payload: configState,
      },
      'Platform configuration parameters saved successfully',
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Credentials copied to clipboard');
    setTimeout(() => setCopied(false), 2200);
  };

  const filteredTickets = tickets.filter((t) => {
    if (ticketStatusFilter !== 'ALL' && t.status !== ticketStatusFilter) return false;
    if (ticketPriorityFilter !== 'ALL' && t.priority !== ticketPriorityFilter) return false;
    return true;
  });

  const renderHeader = () => {
    switch (currentTab) {
      case 'tenants':
        return (
          <PageTitle
            eyebrow="RRMS PLATFORM GOVERNANCE · MULTI-TENANCY"
            title="Resort Properties & Multi-Tenant Shards"
            description="Super Admin provisions and maintains resort properties and links them to primary Owners."
          />
        );
      case 'owners':
        return (
          <PageTitle
            eyebrow="RRMS PLATFORM GOVERNANCE · PRIMARY EXECUTIVES"
            title="Resort Owner Accounts Management"
            description="Super Admin manages high-level Owner identities across all tenants. Staff & guests are managed downstream by Owners."
          />
        );
      case 'tickets':
        return (
          <PageTitle
            eyebrow="OPERATIONS & INCIDENTS · TECHNICAL ESCALATIONS"
            title="Resort Support Tickets & Workflow Issues"
            description="Technical incidents, gateway issues, and integration escalations reported by Resort Owners."
            actions={
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setTelemetrySyncing(true);
                  setTimeout(() => {
                    setTelemetrySyncing(false);
                    toast.success('Incident queue refreshed from shard telemetry');
                  }, 600);
                }}
                className="flex items-center gap-1.5"
              >
                <RefreshCw size={14} className={telemetrySyncing ? 'animate-spin' : ''} />
                Refresh Incidents
              </Button>
            }
          />
        );
      case 'config':
        return (
          <PageTitle
            eyebrow="RRMS PLATFORM GOVERNANCE · CLUSTER PARAMETERS"
            title="Platform Governance & Infrastructure Configuration"
            description="Global cluster parameters, security policies, maintenance mode, and resource allocation."
          />
        );
      case 'audit':
        return (
          <PageTitle
            eyebrow="SECURITY & GOVERNANCE · AUDIT TRAIL"
            title="Platform Security & Governance Audit Trail"
            description="Complete audit record of provisioning actions, credential updates, configuration changes, and incident resolution."
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadCsv(
                    `platform-audit-logs-${today()}.csv`,
                    auditLogs.map((l) => ({
                      ID: l.id,
                      Timestamp: l.timestamp,
                      Actor: l.actor,
                      Action: l.action,
                      Tenant: l.tenantCode || 'PLATFORM',
                      Severity: l.severity,
                      Details: l.details,
                    })),
                  )
                }
                className="flex items-center gap-1.5"
              >
                <Download size={14} /> Export Audit CSV
              </Button>
            }
          />
        );
      case 'monitoring':
        return (
          <PageTitle
            eyebrow="SYSTEM TELEMETRY · RUNTIME SHARDING"
            title="Infrastructure Telemetry & Runtime Sharding"
            description="Live node metrics, JVM heap memory, database connection pool, and security counters."
            actions={
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setTelemetrySyncing(true);
                  setTimeout(() => {
                    setTelemetrySyncing(false);
                    toast.success('Telemetry counters refreshed from distributed nodes');
                  }, 600);
                }}
                className="flex items-center gap-1.5"
              >
                <RefreshCw size={14} className={telemetrySyncing ? 'animate-spin' : ''} />
                Sync Telemetry
              </Button>
            }
          />
        );
      case 'overview':
      default:
        return (
          <PageTitle
            eyebrow="RRMS MULTI-TENANT PLATFORM GOVERNANCE · ARCHITECTURE SPEC"
            title="Super Admin Command Center"
            description="Global platform administration: provision resort tenants and primary owners, resolve technical escalations, and manage platform configuration."
            actions={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTelemetrySyncing(true);
                    setTimeout(() => {
                      setTelemetrySyncing(false);
                      toast.success('Telemetry synchronized with distributed tenant shards');
                    }, 600);
                  }}
                  className="flex items-center gap-1.5"
                >
                  <RefreshCw size={14} className={telemetrySyncing ? 'animate-spin' : ''} />
                  Sync Telemetry
                </Button>
                <Button
                  size="sm"
                  onClick={() => setCreateTenantModal(true)}
                  className="flex items-center gap-1.5 bg-[#C9A227] hover:bg-[#B38F1E] text-white"
                >
                  <Plus size={15} />
                  Provision Resort & Owner
                </Button>
              </div>
            }
          />
        );
    }
  };

  return (
    <PageMotion>
      <div className="space-y-6">
        {/* Dynamic Contextual Header */}
        {renderHeader()}

        {/* TAB 1: OVERVIEW */}
        {currentTab === 'overview' && (
          <div className="space-y-6">
            {/* Global KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 border-l-4 border-l-[#1F3A2E]">
                <div className="flex items-center justify-between text-xs text-[#6B7160] font-semibold mb-1">
                  <span>ACTIVE RESORTS</span>
                  <Building2 size={16} className="text-[#1F3A2E]" />
                </div>
                <div className="text-2xl font-bold font-serif text-[#1F3A2E]">
                  {tenants.filter((t) => t.status === 'Active').length}
                  <span className="text-xs font-sans text-[#6B7160] font-normal ml-1.5">
                    / {tenants.length} Total
                  </span>
                </div>
                <div className="text-[11px] text-[#6B7160] mt-1 flex items-center gap-1">
                  <span className="text-emerald-700 font-semibold font-mono">Isolated Shards</span>{' '}
                  · Dedicated tenant schemas
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-[#C9A227]">
                <div className="flex items-center justify-between text-xs text-[#6B7160] font-semibold mb-1">
                  <span>RESORT OWNERS</span>
                  <Users size={16} className="text-[#C9A227]" />
                </div>
                <div className="text-2xl font-bold font-serif text-[#1F3A2E]">
                  {ownerAccounts.length}
                </div>
                <div className="text-[11px] text-[#6B7160] mt-1">
                  {ownerAccounts.filter((a) => a.active).length} Active primary resort owners
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-amber-600">
                <div className="flex items-center justify-between text-xs text-[#6B7160] font-semibold mb-1">
                  <span>INCIDENTS & ISSUES</span>
                  <LifeBuoy size={16} className="text-amber-600" />
                </div>
                <div className="text-2xl font-bold font-serif text-[#1F3A2E] flex items-center gap-2">
                  {openTickets.length}
                  {criticalTickets.length > 0 && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-sans font-bold flex items-center gap-1">
                      <Flame size={12} /> {criticalTickets.length} Critical
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#6B7160] mt-1">
                  {tickets.length - openTickets.length} resolved technical incidents
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-emerald-600">
                <div className="flex items-center justify-between text-xs text-[#6B7160] font-semibold mb-1">
                  <span>PLATFORM STATUS</span>
                  <Activity size={16} className="text-emerald-600" />
                </div>
                <div className="text-2xl font-bold font-serif text-emerald-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  {config.maintenanceMode ? 'MAINTENANCE' : 'HEALTHY'}
                </div>
                <div className="text-[11px] text-[#6B7160] mt-1 flex items-center justify-between">
                  <span>Uptime: 99.98%</span>
                  <span className="font-mono text-emerald-700 font-bold">JVM 21 Online</span>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Incident Queue */}
              <Card className="p-5">
                <CardHead
                  title="Owner Incident & Escalation Queue"
                  subtitle="Recent technical workflow issues submitted by resort owners"
                  action={
                    <Button variant="ghost" size="sm" onClick={() => setTab('tickets')}>
                      View All Tickets →
                    </Button>
                  }
                />
                <div className="space-y-3 mt-4">
                  {tickets.slice(0, 4).map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setTicketStatus(ticket.status);
                        setTicketResolution(ticket.resolutionNotes || '');
                      }}
                      className="p-3.5 rounded-xl border border-[#F0EBE1] hover:border-[#C9A227] bg-[#FAF7F2] hover:bg-white transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              ticket.priority === 'CRITICAL'
                                ? 'bg-red-100 text-red-800'
                                : ticket.priority === 'HIGH'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-[#1F3A2E]">
                            [{ticket.tenantCode}]
                          </span>
                          <span className="text-[10px] text-[#6B7160]">· {ticket.category}</span>
                        </div>
                        <h4 className="font-semibold text-xs text-[#1F3A2E] truncate">
                          {ticket.title}
                        </h4>
                        <p className="text-[11px] text-[#6B7160] truncate mt-0.5">
                          {ticket.description}
                        </p>
                      </div>
                      <Badge>{ticket.status}</Badge>
                    </div>
                  ))}
                  {tickets.length === 0 && (
                    <Empty
                      title="No open incidents"
                      description="All resort technical workflows are currently operational."
                    />
                  )}
                </div>
              </Card>

              {/* Quick Tenants Status Overview */}
              <Card className="p-5">
                <CardHead
                  title="Provisioned Resort Tenants"
                  subtitle="Multi-tenant shards and primary assigned owners"
                  action={
                    <Button variant="ghost" size="sm" onClick={() => setTab('tenants')}>
                      Manage Tenants →
                    </Button>
                  }
                />
                <div className="space-y-3 mt-4">
                  {tenants.slice(0, 4).map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-lg border border-[#F0EBE1] bg-[#FAF7F2] flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-[#1F3A2E]/10 text-[#1F3A2E] px-2 py-0.5 rounded">
                            {t.code}
                          </span>
                          <strong className="text-xs text-[#1F3A2E]">{t.name}</strong>
                        </div>
                        <div className="text-[11px] text-[#6B7160] mt-1">
                          Owner: <strong>{t.ownerName}</strong> ({t.ownerEmail}) · {t.tier} Tier
                        </div>
                      </div>
                      <Badge>{t.status}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Platform Quick Controls */}
            <Card className="p-5">
              <CardHead
                title="Platform Governance Controls"
                subtitle="Instant platform maintenance switches and operational toggles"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E9DFCE] flex items-center justify-between">
                  <div>
                    <strong className="block text-[#1F3A2E] font-semibold">Maintenance Mode</strong>
                    <span className="text-[#6B7160]">Blocks all non-superadmin traffic</span>
                  </div>
                  <Button
                    size="sm"
                    variant={config.maintenanceMode ? 'destructive' : 'outline'}
                    onClick={() =>
                      act({ type: 'superadmin.maintenance.toggle' }, 'Maintenance mode updated')
                    }
                  >
                    {config.maintenanceMode ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E9DFCE] flex items-center justify-between">
                  <div>
                    <strong className="block text-[#1F3A2E] font-semibold">
                      Tenant Self-Registration
                    </strong>
                    <span className="text-[#6B7160]">
                      {config.registrationOpen ? 'Open to public' : 'Disabled (Invite only)'}
                    </span>
                  </div>
                  <Badge>{config.registrationOpen ? 'Enabled' : 'Disabled'}</Badge>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E9DFCE] flex items-center justify-between">
                  <div>
                    <strong className="block text-[#1F3A2E] font-semibold">
                      Max Tenants Capacity
                    </strong>
                    <span className="text-[#6B7160]">
                      {tenants.length} of {config.maxTenants} allocated
                    </span>
                  </div>
                  <span className="font-mono font-bold text-sm text-[#1F3A2E]">
                    {Math.round((tenants.length / config.maxTenants) * 100)}%
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: RESORTS & TENANTS */}
        {currentTab === 'tenants' && (
          <div className="space-y-4">
            <Card className="p-5">
              <CardHead
                title="Tenant Shards & Infrastructure Directory"
                subtitle={`${tenants.length} provisioned resort properties running on dedicated isolated database schemas`}
              />

              <div className="mt-4">
                <DataTable
                  rows={tenants}
                  searchBy={(t) =>
                    `${t.name} ${t.code} ${t.ownerName} ${t.resortEmail ?? ''} ${t.ownerEmail} ${t.location}`
                  }
                  placeholder="Search resorts by name, tenant code, owner, or location..."
                  columns={[
                    {
                      key: 'code',
                      label: 'Tenant Code',
                      sort: (t) => t.code,
                      render: (t) => (
                        <span className="font-mono font-bold text-xs bg-[#1F3A2E]/10 text-[#1F3A2E] px-2 py-0.5 rounded">
                          {t.code}
                        </span>
                      ),
                    },
                    {
                      key: 'name',
                      label: 'Resort Property',
                      sort: (t) => t.name,
                      render: (t) => (
                        <div>
                          <strong className="text-xs text-[#1F3A2E]">{t.name}</strong>
                          <div className="text-[11px] text-[#6B7160]">
                            {t.location || 'Candolim, Goa'}
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'owner',
                      label: 'Primary Owner',
                      render: (t) => (
                        <div>
                          <span className="text-xs font-semibold text-[#1F3A2E]">
                            {t.ownerName}
                          </span>
                          <div className="font-mono text-[11px] text-[#6B7160]">{t.ownerEmail}</div>
                        </div>
                      ),
                    },
                    {
                      key: 'tier',
                      label: 'SaaS Plan',
                      render: (t) => (
                        <span className="text-xs font-medium text-[#1F3A2E] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E9DFCE]">
                          {t.tier || 'Enterprise'}
                        </span>
                      ),
                    },
                    {
                      key: 'status',
                      label: 'Tenant Status',
                      render: (t) => <Badge>{t.status}</Badge>,
                    },
                    {
                      key: 'rooms',
                      label: 'Rooms Capacity',
                      render: (t) => (
                        <span className="text-xs font-mono text-[#6B7160]">
                          {t.roomsCount ?? 24} Rooms
                        </span>
                      ),
                    },
                    {
                      key: 'actions',
                      label: 'Actions',
                      render: (t) => (
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditTenant(t);
                              setEditTenantName(t.name);
                              setEditTenantStatus(t.status);
                              setEditTenantTier(t.tier || 'Enterprise');
                              setEditTenantLocation(t.location || '');
                              setEditTenantRooms(t.roomsCount ?? 24);
                            }}
                            className="text-xs"
                          >
                            <Pencil size={12} className="mr-1" /> Edit Details
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: OWNER ACCOUNTS */}
        {currentTab === 'owners' && (
          <div className="space-y-4">
            <Card className="p-5">
              <CardHead
                title="Primary Resort Owners Directory"
                subtitle={`${ownerAccounts.length} primary executive accounts registered across active tenant organizations`}
              />

              <div className="mt-4">
                <DataTable
                  rows={ownerAccounts}
                  searchBy={(a) => `${a.name} ${a.email} ${a.tenantId || ''}`}
                  placeholder="Search resort owners by name, email, or tenant code..."
                  columns={[
                    {
                      key: 'name',
                      label: 'Owner Name',
                      sort: (a) => a.name,
                      render: (a) => (
                        <div>
                          <strong className="text-xs text-[#1F3A2E]">{a.name}</strong>
                          <div className="text-[11px] text-[#6B7160]">Primary Tenant Executive</div>
                        </div>
                      ),
                    },
                    {
                      key: 'email',
                      label: 'Login Email',
                      sort: (a) => a.email,
                      render: (a) => (
                        <span className="font-mono text-xs text-[#1F3A2E]">{a.email}</span>
                      ),
                    },
                    {
                      key: 'tenant',
                      label: 'Tenant Shard',
                      render: (a) => (
                        <span className="font-mono font-bold text-xs bg-[#1F3A2E]/10 text-[#1F3A2E] px-2 py-0.5 rounded">
                          {a.tenantId || 'PALM'}
                        </span>
                      ),
                    },
                    {
                      key: 'status',
                      label: 'Account Status',
                      render: (a) => <Badge>{a.active ? 'Active' : 'Suspended'}</Badge>,
                    },
                    {
                      key: 'password',
                      label: 'Demo Password',
                      render: (a) => (
                        <span className="font-mono text-xs text-[#C9A227]">{a.password}</span>
                      ),
                    },
                    {
                      key: 'actions',
                      label: 'Manage',
                      render: (a) => (
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditOwner(a);
                              setEditOwnerName(a.name);
                              setEditOwnerEmail(a.email);
                              setEditOwnerPassword(a.password);
                              setEditOwnerActive(a.active);
                            }}
                            className="text-xs"
                          >
                            <KeyRound size={12} className="mr-1" /> Manage Credentials
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              act(
                                {
                                  type: 'superadmin.owner.update',
                                  payload: { id: a.id, active: !a.active },
                                },
                                `Account ${a.email} ${a.active ? 'suspended' : 'activated'}`,
                              );
                            }}
                            className={`text-xs ${a.active ? 'text-amber-700 hover:text-red-700' : 'text-emerald-700'}`}
                          >
                            {a.active ? 'Suspend' : 'Activate'}
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </Card>
          </div>
        )}

        {/* TAB 4: SUPPORT TICKETS & WORKFLOW ISSUES */}
        {currentTab === 'tickets' && (
          <div className="space-y-4">
            <Card className="p-5">
              <CardHead
                title="Incident & Escalation Queue"
                subtitle="Filter, inspect, and update technical support requests submitted by resort owners."
                action={
                  <div className="flex items-center gap-2">
                    <select
                      value={ticketStatusFilter}
                      onChange={(e) => setTicketStatusFilter(e.target.value)}
                      className="text-xs bg-[#FAF7F2] border border-[#E9DFCE] rounded-lg px-2.5 py-1.5 font-semibold text-[#1F3A2E]"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="OPEN">Open Only</option>
                      <option value="IN_PROGRESS">In Progress Only</option>
                      <option value="RESOLVED">Resolved Only</option>
                      <option value="CLOSED">Closed Only</option>
                    </select>

                    <select
                      value={ticketPriorityFilter}
                      onChange={(e) => setTicketPriorityFilter(e.target.value)}
                      className="text-xs bg-[#FAF7F2] border border-[#E9DFCE] rounded-lg px-2.5 py-1.5 font-semibold text-[#1F3A2E]"
                    >
                      <option value="ALL">All Priorities</option>
                      <option value="CRITICAL">Critical</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>

                    <Button
                      size="sm"
                      onClick={() => setCreateTicketModal(true)}
                      className="bg-[#C9A227] hover:bg-[#B38F1E] text-white flex items-center gap-1"
                    >
                      <Plus size={14} /> Open Incident
                    </Button>
                  </div>
                }
              />

              <div className="space-y-3 mt-4">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 rounded-xl border border-[#E9DFCE] bg-[#FAF7F2] hover:bg-white transition-all space-y-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              ticket.priority === 'CRITICAL'
                                ? 'bg-red-100 text-red-800'
                                : ticket.priority === 'HIGH'
                                  ? 'bg-amber-100 text-amber-800'
                                  : ticket.priority === 'MEDIUM'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                          <span className="text-xs font-mono font-bold text-[#1F3A2E]">
                            [{ticket.tenantCode}] {ticket.resortName}
                          </span>
                          <span className="text-xs text-[#6B7160]">
                            · Category: {ticket.category}
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-sm text-[#1F3A2E]">
                          {ticket.title}
                        </h3>
                        <div className="text-[11px] text-[#6B7160] mt-0.5 flex items-center gap-2 flex-wrap">
                          <span>
                            Reported by: <strong>{ticket.ownerName}</strong> ({ticket.ownerEmail})
                          </span>
                          <span>·</span>
                          <span>
                            Assigned to:{' '}
                            <strong className="text-[#1F3A2E]">
                              {ticket.assigneeName || 'Platform Administrator'}
                            </strong>
                          </span>
                          <span>·</span>
                          <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                          ticket.status === 'CLOSED'
                            ? 'bg-slate-100 text-slate-700 border-slate-300'
                            : ticket.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : ticket.status === 'IN_PROGRESS'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-blue-100 text-blue-800 border-blue-300'
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#22261F] leading-relaxed bg-white/80 p-3 rounded-lg border border-[#F0EBE1]">
                      {ticket.description}
                    </p>

                    {/* Ticket Attachments */}
                    {ticket.attachments && ticket.attachments.length > 0 && (
                      <div className="p-3 bg-white rounded-lg border border-[#F0EBE1] space-y-2">
                        <div className="text-[11px] font-semibold text-[#1F3A2E] flex items-center gap-1.5">
                          <Paperclip size={13} className="text-[#C9A227]" />
                          Attachments ({ticket.attachments.length}):
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {ticket.attachments.map((att) => (
                            <button
                              key={att.id}
                              type="button"
                              onClick={() => setPreviewAttachment(att)}
                              className="flex items-center gap-2 p-1.5 bg-[#FAF7F2] hover:bg-[#F5EFE6] border border-[#E9DFCE] rounded-lg text-left text-xs transition-colors group cursor-pointer"
                            >
                              {att.type.startsWith('image/') ? (
                                <img
                                  src={att.dataUrl}
                                  alt={att.name}
                                  className="w-8 h-8 rounded object-cover border border-[#E9DFCE]"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                                  <FileText size={16} />
                                </div>
                              )}
                              <div className="max-w-[140px] truncate">
                                <span className="block truncate font-medium text-[11px] text-[#1F3A2E] group-hover:underline">
                                  {att.name}
                                </span>
                                <span className="block text-[10px] text-[#6B7160]">
                                  {(att.size / 1024).toFixed(0)} KB
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Replies count indicator */}
                    {ticket.replies && ticket.replies.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-[#1F3A2E] bg-amber-50/70 border border-amber-200/60 px-3 py-1.5 rounded-lg">
                        <MessageSquare size={13} className="text-[#C9A227]" />
                        <span className="font-semibold">
                          {ticket.replies.length}{' '}
                          {ticket.replies.length === 1 ? 'reply' : 'replies'} exchanged
                        </span>
                        <span className="text-[#6B7160] text-[11px]">
                          (Latest from {ticket.replies[ticket.replies.length - 1].senderName})
                        </span>
                      </div>
                    )}

                    {Boolean(ticket.resolutionNotes?.trim()) && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                        <strong className="text-emerald-900 block font-semibold flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-emerald-700" />
                          Super Admin Resolution / Engineering Notes:
                        </strong>
                        <p className="text-emerald-800 leading-relaxed font-sans">
                          {ticket.resolutionNotes}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setTicketStatus(ticket.status);
                          setTicketPriority(ticket.priority);
                          setTicketResolution(ticket.resolutionNotes || '');
                          setAdminReply('');
                          setAdminReplyAttachments([]);
                        }}
                        className="text-xs flex items-center gap-1.5"
                      >
                        <MessageSquare size={13} /> Manage Ticket & Replies →
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredTickets.length === 0 && (
                  <Empty
                    title="No tickets found"
                    description="No technical tickets match the active status or priority filter."
                  />
                )}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 5: PLATFORM CONFIGURATION */}
        {currentTab === 'config' && (
          <div className="space-y-4">
            <Card className="p-5">
              <CardHead
                title="Cluster Governance Parameters"
                subtitle="Global configuration settings and operational policies across all tenant shards."
              />

              <form onSubmit={handleSaveConfig} className="space-y-5 mt-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E9DFCE] space-y-3">
                    <strong className="text-sm font-semibold text-[#1F3A2E] block">
                      Platform Access & Self-Registration
                    </strong>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={configState.maintenanceMode}
                        onChange={(e) =>
                          setConfigState({ ...configState, maintenanceMode: e.target.checked })
                        }
                        className="rounded"
                      />
                      <div>
                        <span className="font-semibold text-[#1F3A2E] block">Maintenance Mode</span>
                        <span className="text-[#6B7160]">
                          Temporarily restrict access to Super Admin only.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={configState.registrationOpen}
                        onChange={(e) =>
                          setConfigState({ ...configState, registrationOpen: e.target.checked })
                        }
                        className="rounded"
                      />
                      <div>
                        <span className="font-semibold text-[#1F3A2E] block">
                          Public Self-Registration
                        </span>
                        <span className="text-[#6B7160]">
                          Allow self-provisioning. Keep disabled to maintain strict identity
                          hierarchy.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={configState.enforceMfa}
                        onChange={(e) =>
                          setConfigState({ ...configState, enforceMfa: e.target.checked })
                        }
                        className="rounded"
                      />
                      <div>
                        <span className="font-semibold text-[#1F3A2E] block">
                          Enforce Multi-Factor Auth (MFA)
                        </span>
                        <span className="text-[#6B7160]">
                          Require MFA token for all Owner and Manager sign-in sessions.
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E9DFCE] space-y-3">
                    <strong className="text-sm font-semibold text-[#1F3A2E] block">
                      Capacity & Storage Policies
                    </strong>
                    <label className="block space-y-1">
                      <span className="font-semibold text-[#1F3A2E]">Max Tenant Cap</span>
                      <input
                        type="number"
                        min="5"
                        max="200"
                        value={configState.maxTenants}
                        onChange={(e) =>
                          setConfigState({ ...configState, maxTenants: Number(e.target.value) })
                        }
                        className="w-full p-2 border border-[#E9DFCE] rounded-lg bg-white"
                      />
                    </label>

                    <label className="block space-y-1">
                      <span className="font-semibold text-[#1F3A2E]">
                        Session Inactivity Timeout (Minutes)
                      </span>
                      <input
                        type="number"
                        min="15"
                        max="240"
                        value={configState.sessionTimeoutMinutes}
                        onChange={(e) =>
                          setConfigState({
                            ...configState,
                            sessionTimeoutMinutes: Number(e.target.value),
                          })
                        }
                        className="w-full p-2 border border-[#E9DFCE] rounded-lg bg-white"
                      />
                    </label>

                    <label className="block space-y-1">
                      <span className="font-semibold text-[#1F3A2E]">
                        Audit Trail Retention (Days)
                      </span>
                      <input
                        type="number"
                        min="30"
                        max="365"
                        value={configState.logRetentionDays}
                        onChange={(e) =>
                          setConfigState({
                            ...configState,
                            logRetentionDays: Number(e.target.value),
                          })
                        }
                        className="w-full p-2 border border-[#E9DFCE] rounded-lg bg-white"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block space-y-1">
                    <span className="font-semibold text-[#1F3A2E]">
                      Distributed Database Backup Schedule
                    </span>
                    <input
                      type="text"
                      value={configState.backupSchedule}
                      onChange={(e) =>
                        setConfigState({ ...configState, backupSchedule: e.target.value })
                      }
                      className="w-full p-2 border border-[#E9DFCE] rounded-lg bg-white"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="font-semibold text-[#1F3A2E]">Platform Timezone</span>
                    <input
                      type="text"
                      value={configState.defaultTimezone}
                      onChange={(e) =>
                        setConfigState({ ...configState, defaultTimezone: e.target.value })
                      }
                      className="w-full p-2 border border-[#E9DFCE] rounded-lg bg-white"
                    />
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#F0EBE1]">
                  <Button type="button" variant="outline" onClick={() => setConfigState(config)}>
                    Reset Defaults
                  </Button>
                  <Button type="submit" className="bg-[#1F3A2E] hover:bg-[#2A4D3E] text-white">
                    Save Platform Configuration
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* TAB 6: PLATFORM AUDIT LOGS */}
        {currentTab === 'audit' && (
          <div className="space-y-4">
            <Card className="p-5">
              <CardHead
                title="Audit Trail & Security Events"
                subtitle="Immutable security logs of administrative interventions, provisioning, and credentials access."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadCsv(
                        `platform-audit-logs-${today()}.csv`,
                        auditLogs.map((l) => ({
                          ID: l.id,
                          Timestamp: l.timestamp,
                          Actor: l.actor,
                          Action: l.action,
                          Tenant: l.tenantCode || 'PLATFORM',
                          Severity: l.severity,
                          Details: l.details,
                        })),
                      )
                    }
                    className="flex items-center gap-1.5"
                  >
                    <Download size={14} /> Export Audit CSV
                  </Button>
                }
              />

              <div className="mt-4">
                <DataTable
                  rows={auditLogs}
                  searchBy={(l) => `${l.action} ${l.actor} ${l.tenantCode || ''} ${l.details}`}
                  placeholder="Search audit trail by action, actor, tenant code, or details..."
                  columns={[
                    {
                      key: 'timestamp',
                      label: 'Timestamp',
                      sort: (l) => l.timestamp,
                      render: (l) => (
                        <span className="font-mono text-xs text-[#6B7160]">
                          {new Date(l.timestamp).toLocaleString()}
                        </span>
                      ),
                    },
                    {
                      key: 'action',
                      label: 'Audit Action',
                      sort: (l) => l.action,
                      render: (l) => (
                        <span className="font-mono font-bold text-xs text-[#1F3A2E]">
                          {l.action}
                        </span>
                      ),
                    },
                    {
                      key: 'tenantCode',
                      label: 'Tenant',
                      render: (l) => (
                        <span className="font-mono text-xs bg-[#1F3A2E]/10 text-[#1F3A2E] px-1.5 py-0.5 rounded font-semibold">
                          {l.tenantCode || 'PLATFORM'}
                        </span>
                      ),
                    },
                    {
                      key: 'actor',
                      label: 'Actor',
                      render: (l) => <span className="text-xs text-[#1F3A2E]">{l.actor}</span>,
                    },
                    {
                      key: 'severity',
                      label: 'Severity',
                      render: (l) => (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            l.severity === 'CRITICAL'
                              ? 'bg-red-100 text-red-800'
                              : l.severity === 'WARNING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {l.severity}
                        </span>
                      ),
                    },
                    {
                      key: 'details',
                      label: 'Event Details',
                      render: (l) => (
                        <span className="text-xs text-[#22261F] block max-w-md truncate">
                          {l.details}
                        </span>
                      ),
                    },
                  ]}
                />
              </div>
            </Card>
          </div>
        )}

        {/* TAB 7: SYSTEM TELEMETRY */}
        {currentTab === 'monitoring' && (
          <div className="space-y-6">
            <Card className="p-5">
              <CardHead
                title="Live Cluster Health & Node Telemetry"
                subtitle="Real-time JVM metrics, query latency, database connection pools, and shard node telemetry."
                action={
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setTelemetrySyncing(true);
                      setTimeout(() => {
                        setTelemetrySyncing(false);
                        toast.success('Telemetry counters refreshed from distributed nodes');
                      }, 500);
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <RefreshCw size={13} className={telemetrySyncing ? 'animate-spin' : ''} />
                    Refresh Node Telemetry
                  </Button>
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E9DFCE] space-y-2">
                  <span className="text-xs font-semibold text-[#6B7160] block">
                    JVM RUNTIME HEAP ALLOCATION
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-serif font-bold text-[#1F3A2E]">142 MB</span>
                    <span className="text-xs font-mono font-semibold text-[#6B7160]">
                      Max: 512 MB
                    </span>
                  </div>
                  <div className="w-full bg-[#E9DFCE] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#1F3A2E] h-full rounded-full transition-all duration-500"
                      style={{ width: '28%' }}
                    />
                  </div>
                  <div className="text-[11px] text-[#6B7160]">
                    Free Heap: 370 MB (28% allocated capacity)
                  </div>
                </div>

                <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E9DFCE] space-y-2">
                  <span className="text-xs font-semibold text-[#6B7160] block">
                    CLUSTER UPTIME & CONCURRENCY
                  </span>
                  <div className="text-2xl font-serif font-bold text-[#1F3A2E]">18d 06h 44m</div>
                  <div className="text-xs text-[#6B7160] space-y-0.5">
                    <div>
                      Active Virtual Threads:{' '}
                      <strong className="font-mono text-[#1F3A2E]">32 threads</strong>
                    </div>
                    <div>
                      Available CPU Cores:{' '}
                      <strong className="font-mono text-[#1F3A2E]">8 cores</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E9DFCE] space-y-2">
                  <span className="text-xs font-semibold text-[#6B7160] block">
                    PERSISTENCE & ISOLATION
                  </span>
                  <div className="text-2xl font-serif font-bold text-emerald-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    CONNECTED
                  </div>
                  <div className="text-xs text-[#6B7160]">
                    HikariPool Status:{' '}
                    <strong className="text-emerald-700">Healthy (0 waiting)</strong>
                  </div>
                  <div className="text-[11px] text-[#6B7160]">
                    Total Audit Records:{' '}
                    <strong className="font-mono text-[#1F3A2E]">{auditLogs.length}</strong>
                  </div>
                </div>
              </div>

              {/* User Breakdown by Role */}
              <div className="mt-6 pt-4 border-t border-[#F0EBE1]">
                <h3 className="text-xs font-bold text-[#1F3A2E] uppercase tracking-wider mb-3">
                  Account Distribution by RBAC Role
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    {
                      role: 'SUPER_ADMIN',
                      label: 'Super Admins',
                      count: s.accounts.filter((a) => a.module === 'SuperAdmin').length,
                    },
                    { role: 'OWNER', label: 'Resort Owners', count: ownerAccounts.length },
                    {
                      role: 'MANAGEMENT',
                      label: 'Managers',
                      count: s.accounts.filter((a) => a.module === 'Management').length,
                    },
                    {
                      role: 'STAFF',
                      label: 'Resort Staff',
                      count: s.accounts.filter((a) => a.module === 'Staff').length,
                    },
                    {
                      role: 'GUEST',
                      label: 'Guests',
                      count: s.accounts.filter((a) => a.module === 'Guest').length,
                    },
                  ].map((item) => (
                    <div
                      key={item.role}
                      className="p-3 bg-[#FAF7F2] rounded-lg border border-[#F0EBE1] text-center"
                    >
                      <span className="text-[11px] text-[#6B7160] block">{item.label}</span>
                      <span className="text-xl font-bold font-mono text-[#1F3A2E]">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* MODAL 1: PROVISION NEW RESORT & OWNER */}
        <Modal
          open={createTenantModal}
          onClose={() => setCreateTenantModal(false)}
          title="Provision New Resort & Owner"
          description="Deploy a dedicated tenant shard and provision the resort's primary administrative owner credentials in an atomic transaction."
          wide
        >
          <form onSubmit={handleCreateTenantAndOwner} className="flex flex-col flex-1 min-h-0">
            <div className="dialog-body space-y-5">
              {/* Section 1: Resort Property Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1F3A2E] tracking-wider uppercase border-b border-[#F0EBE1] pb-1.5">
                  <Building2 size={15} className="text-[#C9A227]" />
                  Resort Identity & Property Details
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F3A2E] mb-1.5">
                      Resort Property Name <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-[#E9DFCE] focus-within:border-[#C9A227] focus-within:ring-2 focus-within:ring-[#C9A227]/20 rounded-xl transition-all">
                      <Building2 size={16} className="text-[#6B7160] shrink-0" />
                      <input
                        type="text"
                        required
                        value={tenantName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTenantName(val);
                          // Auto suggest tenant code if not manually set
                          if (
                            !tenantCode ||
                            tenantCode === tenantName.split(' ')[0]?.toUpperCase()
                          ) {
                            const suggested = val
                              .split(' ')[0]
                              ?.replace(/[^a-zA-Z0-9]/g, '')
                              .toUpperCase()
                              .slice(0, 10);
                            if (suggested) setTenantCode(suggested);
                          }
                        }}
                        placeholder="e.g. The Sapphire Beachfront"
                        style={{ border: 'none', outline: 'none', padding: 0, boxShadow: 'none' }}
                        className="w-full bg-transparent text-xs placeholder:text-[#6B7160]/50"
                      />
                    </div>
                    <span className="text-[11px] text-[#6B7160] mt-1 block">
                      Full legal or branded name of the resort property.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F3A2E] mb-1.5 flex items-center justify-between">
                      <span>
                        Resort / Tenant Code <span className="text-red-500">*</span>
                      </span>
                      <span className="font-mono text-[10px] text-[#6B7160] font-normal uppercase">
                        SHARD IDENTIFIER
                      </span>
                    </label>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-[#E9DFCE] focus-within:border-[#C9A227] focus-within:ring-2 focus-within:ring-[#C9A227]/20 rounded-xl transition-all">
                      <KeyRound size={16} className="text-[#6B7160] shrink-0" />
                      <input
                        type="text"
                        required
                        value={tenantCode}
                        onChange={(e) =>
                          setTenantCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))
                        }
                        placeholder="e.g. SAPPHIRE"
                        style={{ border: 'none', outline: 'none', padding: 0, boxShadow: 'none' }}
                        className="w-full bg-transparent text-xs font-mono uppercase tracking-wider font-bold placeholder:text-[#6B7160]/50"
                      />
                    </div>
                    <span className="text-[11px] text-[#6B7160] mt-1 block">
                      Unique alphanumeric shard key used for URL routing and tenant data isolation.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F3A2E] mb-1.5">
                      Property Location <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-[#E9DFCE] focus-within:border-[#C9A227] focus-within:ring-2 focus-within:ring-[#C9A227]/20 rounded-xl transition-all">
                      <MapPin size={16} className="text-[#6B7160] shrink-0" />
                      <input
                        type="text"
                        required
                        value={tenantLocation}
                        onChange={(e) => setTenantLocation(e.target.value)}
                        placeholder="e.g. Candolim, Goa · India"
                        style={{ border: 'none', outline: 'none', padding: 0, boxShadow: 'none' }}
                        className="w-full bg-transparent text-xs placeholder:text-[#6B7160]/50"
                      />
                    </div>
                    <span className="text-[11px] text-[#6B7160] mt-1 block">
                      Geographic destination and physical address.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F3A2E] mb-1.5">
                      Initial Room Capacity
                    </label>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-[#E9DFCE] focus-within:border-[#C9A227] focus-within:ring-2 focus-within:ring-[#C9A227]/20 rounded-xl transition-all">
                      <BedDouble size={16} className="text-[#6B7160] shrink-0" />
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={roomsCount}
                        onChange={(e) => setRoomsCount(Math.max(1, Number(e.target.value)))}
                        style={{ border: 'none', outline: 'none', padding: 0, boxShadow: 'none' }}
                        className="w-full bg-transparent text-xs"
                      />
                    </div>
                    <span className="text-[11px] text-[#6B7160] mt-1 block">
                      Baseline physical keys provisioned into property management inventory.
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Primary Owner Account */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1F3A2E] tracking-wider uppercase border-b border-[#F0EBE1] pb-1.5">
                  <Users size={15} className="text-[#1F3A2E]" />
                  Primary Owner Account Credentials
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F3A2E] mb-1.5">
                      Owner Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-[#E9DFCE] focus-within:border-[#C9A227] focus-within:ring-2 focus-within:ring-[#C9A227]/20 rounded-xl transition-all">
                      <User size={16} className="text-[#6B7160] shrink-0" />
                      <input
                        type="text"
                        required
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="e.g. Siddharth Singhania"
                        style={{ border: 'none', outline: 'none', padding: 0, boxShadow: 'none' }}
                        className="w-full bg-transparent text-xs placeholder:text-[#6B7160]/50"
                      />
                    </div>
                    <span className="text-[11px] text-[#6B7160] mt-1 block">
                      Full legal name of the resort proprietor or principal.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F3A2E] mb-1.5">
                      Resort Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-[#E9DFCE] focus-within:border-[#C9A227] focus-within:ring-2 focus-within:ring-[#C9A227]/20 rounded-xl transition-all">
                      <Mail size={16} className="text-[#6B7160] shrink-0" />
                      <input
                        type="email"
                        required
                        value={resortEmail}
                        onChange={(e) => setResortEmail(e.target.value)}
                        placeholder="e.g. contact@sapphire.demo"
                        style={{ border: 'none', outline: 'none', padding: 0, boxShadow: 'none' }}
                        className="w-full bg-transparent text-xs placeholder:text-[#6B7160]/50"
                      />
                    </div>
                    <span className="text-[11px] text-[#6B7160] mt-1 block">
                      Primary administrative and operational contact email for the resort.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F3A2E] mb-1.5">
                      Temporary Password <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-[#E9DFCE] focus-within:border-[#C9A227] focus-within:ring-2 focus-within:ring-[#C9A227]/20 rounded-xl transition-all">
                      <Lock size={16} className="text-[#6B7160] shrink-0" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={ownerPassword}
                        onChange={(e) => setOwnerPassword(e.target.value)}
                        placeholder="Resort@123"
                        style={{ border: 'none', outline: 'none', padding: 0, boxShadow: 'none' }}
                        className="w-full bg-transparent text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[#6B7160] hover:text-[#1F3A2E] p-1 cursor-pointer shrink-0"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <span className="text-[11px] text-[#6B7160] mt-1 block">
                      Initial administrative credential for tenant onboarding.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F3A2E] mb-1.5">
                      SaaS Subscription Tier <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-[#E9DFCE] focus-within:border-[#C9A227] focus-within:ring-2 focus-within:ring-[#C9A227]/20 rounded-xl transition-all">
                      <ShieldCheck size={16} className="text-[#6B7160] shrink-0" />
                      <select
                        value={tenantTier}
                        onChange={(e) => setTenantTier(e.target.value)}
                        style={{ border: 'none', outline: 'none', padding: 0, boxShadow: 'none' }}
                        className="w-full bg-transparent text-xs cursor-pointer"
                      >
                        <option value="Enterprise">
                          Enterprise (Dedicated Shard · 99.99% SLA · Full Modules)
                        </option>
                        <option value="Premium">
                          Premium (Enhanced Analytics · Priority Escalations)
                        </option>
                        <option value="Standard">Standard (Core PMS & Essential Operations)</option>
                      </select>
                    </div>
                    <span className="text-[11px] text-[#6B7160] mt-1 block">
                      Allocates compute quotas and platform SLA boundaries.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="dialog-footer flex items-center justify-between">
              <div className="text-[11px] text-[#6B7160] hidden sm:flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Isolated tenant schema allocation</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button type="button" variant="outline" onClick={() => setCreateTenantModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#C9A227] hover:bg-[#B38F1E] text-white flex items-center gap-1.5 shadow-sm font-semibold"
                >
                  <Plus size={15} />
                  Provision Resort & Owner
                </Button>
              </div>
            </div>
          </form>
        </Modal>

        {/* MODAL 2: CREDENTIALS SUMMARY */}
        {createdCredentials && (
          <Modal
            open={!!createdCredentials}
            onClose={() => setCreatedCredentials(null)}
            title="Owner Credentials Provisioned"
            description="The resort property and primary Owner account have been deployed successfully."
            wide
          >
            <div className="flex flex-col flex-1 min-h-0">
              <div className="dialog-body space-y-4">
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-emerald-900 font-bold text-sm">
                      Resort Property & Owner Account Created
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed mt-0.5">
                      Provide these credentials to the resort Owner. They can sign in directly to
                      their dedicated management dashboard using the existing sign-in portal.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-[#FAF7F2] border border-[#E9DFCE] rounded-xl space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between items-center border-b border-[#F0EBE1] pb-2">
                    <span className="text-[#6B7160] font-sans font-medium">Resort Name:</span>
                    <span className="font-bold text-[#1F3A2E] font-sans text-sm">
                      {createdCredentials.resortName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#F0EBE1] pb-2">
                    <span className="text-[#6B7160] font-sans font-medium">Tenant Shard Code:</span>
                    <span className="font-bold text-[#1F3A2E] bg-white px-2 py-0.5 rounded border border-[#E9DFCE]">
                      {createdCredentials.tenantCode}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#F0EBE1] pb-2">
                    <span className="text-[#6B7160] font-sans font-medium">Primary Owner:</span>
                    <span className="font-bold text-[#1F3A2E] font-sans">
                      {createdCredentials.ownerName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#F0EBE1] pb-2">
                    <span className="text-[#6B7160] font-sans font-medium">
                      Resort / Login Email:
                    </span>
                    <span className="font-bold text-[#1F3A2E]">
                      {createdCredentials.resortEmail || createdCredentials.ownerEmail}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-[#E9DFCE]">
                    <span className="text-[#6B7160] font-sans font-medium">
                      Temporary Password:
                    </span>
                    <span className="font-bold text-amber-800 tracking-wider font-mono text-sm">
                      {createdCredentials.tempPassword}
                    </span>
                  </div>
                </div>
              </div>

              <div className="dialog-footer flex items-center justify-between">
                <span className="text-[11px] text-[#6B7160] hidden sm:inline">
                  Share these credentials securely with the resort proprietor.
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      copyToClipboard(
                        `Resort: ${createdCredentials.resortName}\nCode: ${createdCredentials.tenantCode}\nEmail: ${createdCredentials.resortEmail || createdCredentials.ownerEmail}\nPassword: ${createdCredentials.tempPassword}`,
                      )
                    }
                    className="flex items-center gap-1.5"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy Credentials'}
                  </Button>
                  <Button onClick={() => setCreatedCredentials(null)}>Done</Button>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* MODAL 3: EDIT TENANT DETAILS */}
        {editTenant && (
          <Modal
            open={!!editTenant}
            onClose={() => setEditTenant(null)}
            title={`Update Resort: ${editTenant.name} [${editTenant.code}]`}
            description="Update property domain details, active status, plan tier, or room capacity."
            wide
          >
            <form onSubmit={handleUpdateTenant} className="flex flex-col flex-1 min-h-0">
              <div className="dialog-body space-y-4">
                <label className="field block">
                  <span className="text-xs font-semibold text-[#1F3A2E]">
                    Resort Property Name *
                  </span>
                  <input
                    type="text"
                    required
                    value={editTenantName}
                    onChange={(e) => setEditTenantName(e.target.value)}
                    className="w-full mt-1 p-2.5 border border-[#E9DFCE] rounded-lg text-xs"
                  />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="field block">
                    <span className="text-xs font-semibold text-[#1F3A2E]">Tenant Status *</span>
                    <select
                      value={editTenantStatus}
                      onChange={(e: any) => setEditTenantStatus(e.target.value)}
                      className="w-full mt-1 p-2.5 border border-[#E9DFCE] rounded-lg text-xs"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </label>

                  <label className="field block">
                    <span className="text-xs font-semibold text-[#1F3A2E]">SaaS Tier *</span>
                    <select
                      value={editTenantTier}
                      onChange={(e) => setEditTenantTier(e.target.value)}
                      className="w-full mt-1 p-2.5 border border-[#E9DFCE] rounded-lg text-xs"
                    >
                      <option value="Enterprise">Enterprise</option>
                      <option value="Premium">Premium</option>
                      <option value="Standard">Standard</option>
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="field block">
                    <span className="text-xs font-semibold text-[#1F3A2E]">Location</span>
                    <input
                      type="text"
                      value={editTenantLocation}
                      onChange={(e) => setEditTenantLocation(e.target.value)}
                      className="w-full mt-1 p-2.5 border border-[#E9DFCE] rounded-lg text-xs"
                    />
                  </label>

                  <label className="field block">
                    <span className="text-xs font-semibold text-[#1F3A2E]">Rooms Capacity</span>
                    <input
                      type="number"
                      value={editTenantRooms}
                      onChange={(e) => setEditTenantRooms(Number(e.target.value))}
                      className="w-full mt-1 p-2.5 border border-[#E9DFCE] rounded-lg text-xs"
                    />
                  </label>
                </div>
              </div>

              <div className="dialog-footer flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditTenant(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save Tenant Details</Button>
              </div>
            </form>
          </Modal>
        )}

        {/* MODAL 4: MANAGE OWNER ACCOUNT */}
        {editOwner && (
          <Modal
            open={!!editOwner}
            onClose={() => setEditOwner(null)}
            title={`Manage Owner: ${editOwner.name}`}
            description="Manage resort owner profile, credentials, and access activation."
            wide
          >
            <form onSubmit={handleUpdateOwner} className="flex flex-col flex-1 min-h-0">
              <div className="dialog-body space-y-4">
                <label className="field block">
                  <span className="text-xs font-semibold text-[#1F3A2E]">Owner Full Name *</span>
                  <input
                    type="text"
                    required
                    value={editOwnerName}
                    onChange={(e) => setEditOwnerName(e.target.value)}
                    className="w-full mt-1 p-2.5 border border-[#E9DFCE] rounded-lg text-xs"
                  />
                </label>

                <label className="field block">
                  <span className="text-xs font-semibold text-[#1F3A2E]">Login Email *</span>
                  <input
                    type="email"
                    required
                    value={editOwnerEmail}
                    onChange={(e) => setEditOwnerEmail(e.target.value)}
                    className="w-full mt-1 p-2.5 border border-[#E9DFCE] rounded-lg text-xs"
                  />
                </label>

                <label className="field block">
                  <span className="text-xs font-semibold text-[#1F3A2E]">
                    Password / Reset Password *
                  </span>
                  <input
                    type="text"
                    required
                    value={editOwnerPassword}
                    onChange={(e) => setEditOwnerPassword(e.target.value)}
                    className="w-full mt-1 p-2.5 border border-[#E9DFCE] rounded-lg text-xs font-mono"
                  />
                </label>

                <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E9DFCE] flex items-center justify-between">
                  <div>
                    <strong className="text-xs text-[#1F3A2E] block">Account Status</strong>
                    <span className="text-[11px] text-[#6B7160]">
                      {editOwnerActive
                        ? 'Owner can sign in normally.'
                        : 'Account suspended from login.'}
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={editOwnerActive ? 'outline' : 'default'}
                    onClick={() => setEditOwnerActive(!editOwnerActive)}
                  >
                    {editOwnerActive ? 'Active' : 'Suspended'}
                  </Button>
                </div>
              </div>

              <div className="dialog-footer flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditOwner(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save Owner Account</Button>
              </div>
            </form>
          </Modal>
        )}

        {/* MODAL 5: TICKET RESOLUTION & REPLIES */}
        {selectedTicket && (
          <Modal
            open={!!selectedTicket}
            onClose={() => setSelectedTicket(null)}
            title={`Ticket #${selectedTicket.id}: ${selectedTicket.title}`}
            description={`Reported by ${selectedTicket.ownerName} [${selectedTicket.tenantCode}] · Assigned to ${selectedTicket.assigneeName || 'Platform Administrator'}`}
            wide
          >
            <form onSubmit={handleUpdateTicket} className="flex flex-col flex-1 min-h-0">
              <div className="dialog-body space-y-4">
                {/* Status & Priority Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="field block">
                    <span className="text-xs font-semibold text-[#1F3A2E]">Ticket Status *</span>
                    <select
                      value={ticketStatus}
                      onChange={(e: any) => setTicketStatus(e.target.value)}
                      className="w-full mt-1 p-2.5 border border-[#E9DFCE] rounded-lg text-xs font-semibold"
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </label>

                  <label className="field block">
                    <span className="text-xs font-semibold text-[#1F3A2E]">Priority Level *</span>
                    <select
                      value={ticketPriority}
                      onChange={(e: any) => setTicketPriority(e.target.value)}
                      className="w-full mt-1 p-2.5 border border-[#E9DFCE] rounded-lg text-xs font-semibold"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </label>
                </div>

                {/* Issue Description */}
                <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E9DFCE] text-xs space-y-1">
                  <div className="font-semibold text-[#1F3A2E] flex items-center justify-between">
                    <span>Issue Description:</span>
                    <span className="font-normal text-[#6B7160]">
                      {new Date(selectedTicket.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[#22261F] leading-relaxed whitespace-pre-line">
                    {selectedTicket.description}
                  </p>
                </div>

                {/* Attachments from Owner */}
                {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-[#1F3A2E] flex items-center gap-1.5">
                      <Paperclip size={13} className="text-[#C9A227]" />
                      Uploaded Documents & Screenshots ({selectedTicket.attachments.length}):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {selectedTicket.attachments.map((att) => (
                        <button
                          key={att.id}
                          type="button"
                          onClick={() => setPreviewAttachment(att)}
                          className="flex items-center gap-2 p-2 bg-white hover:bg-[#FAF7F2] border border-[#E9DFCE] rounded-lg text-left text-xs transition-all cursor-pointer group"
                        >
                          {att.type.startsWith('image/') ? (
                            <img
                              src={att.dataUrl}
                              alt={att.name}
                              className="w-9 h-9 rounded object-cover border border-[#E9DFCE] shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shrink-0">
                              <FileText size={18} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-[11px] text-[#1F3A2E] group-hover:underline">
                              {att.name}
                            </span>
                            <span className="block text-[10px] text-[#6B7160]">
                              {(att.size / 1024).toFixed(0)} KB
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conversation & Replies Thread */}
                {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                  <div className="space-y-2 border-t border-[#F0EBE1] pt-3">
                    <span className="text-xs font-semibold text-[#1F3A2E] flex items-center gap-1.5">
                      <MessageSquare size={13} className="text-[#C9A227]" />
                      Conversation History ({selectedTicket.replies.length}):
                    </span>
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {selectedTicket.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className={`p-3 rounded-lg text-xs space-y-1 ${
                            reply.senderRole === 'SUPER_ADMIN'
                              ? 'bg-emerald-50/70 border border-emerald-200/80 ml-4'
                              : 'bg-white border border-[#E9DFCE] mr-4'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <strong className="text-[#1F3A2E] flex items-center gap-1">
                              {reply.senderName}
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                  reply.senderRole === 'SUPER_ADMIN'
                                    ? 'bg-emerald-200/80 text-emerald-900'
                                    : 'bg-amber-100 text-amber-900'
                                }`}
                              >
                                {reply.senderRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Owner'}
                              </span>
                            </strong>
                            <span className="text-[#6B7160] text-[10px]">
                              {new Date(reply.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[#22261F] leading-relaxed whitespace-pre-line">
                            {reply.message}
                          </p>
                          {reply.attachments && reply.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {reply.attachments.map((att) => (
                                <button
                                  key={att.id}
                                  type="button"
                                  onClick={() => setPreviewAttachment(att)}
                                  className="text-[10px] text-emerald-800 underline flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded border border-emerald-200"
                                >
                                  <Paperclip size={10} /> {att.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply composer for Super Admin */}
                <div className="space-y-2 border-t border-[#F0EBE1] pt-3">
                  <label className="field block">
                    <span className="text-xs font-semibold text-[#1F3A2E] flex items-center gap-1">
                      <Send size={12} className="text-[#C9A227]" />
                      Reply & Message Owner ({selectedTicket.ownerName})
                    </span>
                    <textarea
                      rows={2}
                      value={adminReply}
                      onChange={(e) => setAdminReply(e.target.value)}
                      placeholder="Type a response or update to send directly to the resort owner..."
                      className="w-full mt-1 p-2.5 border border-[#E9DFCE] rounded-lg text-xs"
                    />
                  </label>
                </div>

                {/* Technical Resolution Notes */}
                <label className="field block">
                  <span className="text-xs font-semibold text-[#1F3A2E]">
                    Engineering Resolution Notes (Internal / Status Audit)
                  </span>
                  <textarea
                    rows={2}
                    value={ticketResolution}
                    onChange={(e) => setTicketResolution(e.target.value)}
                    placeholder="Detail engineering patch, root cause, or resolution steps..."
                    className="w-full mt-1 p-2.5 border border-[#E9DFCE] rounded-lg text-xs"
                  />
                </label>

                {/* Ticket History / Timeline */}
                {selectedTicket.history && selectedTicket.history.length > 0 && (
                  <div className="space-y-1.5 border-t border-[#F0EBE1] pt-2">
                    <span className="text-[11px] font-semibold text-[#6B7160] flex items-center gap-1">
                      <History size={12} />
                      Ticket Lifecycle Audit Trail:
                    </span>
                    <div className="text-[11px] space-y-1 text-[#6B7160] max-h-24 overflow-y-auto pl-2 border-l-2 border-[#E9DFCE]">
                      {selectedTicket.history.map((h) => (
                        <div key={h.id} className="flex items-center gap-2">
                          <span className="font-mono text-[10px]">
                            {new Date(h.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>·</span>
                          <strong className="text-[#1F3A2E]">{h.actorName}</strong>:{' '}
                          {h.details || h.action}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="dialog-footer flex justify-between items-center">
                <span className="text-[11px] text-[#6B7160]">
                  Ticket #{selectedTicket.id} · Priority: {ticketPriority}
                </span>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setSelectedTicket(null)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes & Send Reply</Button>
                </div>
              </div>
            </form>
          </Modal>
        )}

        {/* ATTACHMENT PREVIEW MODAL */}
        {previewAttachment && (
          <Modal
            open={!!previewAttachment}
            onClose={() => setPreviewAttachment(null)}
            title={previewAttachment.name}
            description={`${previewAttachment.type} · ${(previewAttachment.size / 1024).toFixed(0)} KB`}
            wide
          >
            <div className="dialog-body flex flex-col items-center justify-center p-4">
              {previewAttachment.type.startsWith('image/') ? (
                <img
                  src={previewAttachment.dataUrl}
                  alt={previewAttachment.name}
                  className="max-h-[500px] w-auto rounded-lg shadow-md object-contain border border-[#E9DFCE]"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <FileText size={48} className="mx-auto text-amber-600" />
                  <p className="text-sm font-semibold text-[#1F3A2E]">{previewAttachment.name}</p>
                  <p className="text-xs text-[#6B7160]">PDF Document</p>
                  <a
                    href={previewAttachment.dataUrl}
                    download={previewAttachment.name}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F3A2E] text-white rounded-lg text-xs font-semibold hover:bg-[#2B4C3E]"
                  >
                    <Download size={14} /> Download Document
                  </a>
                </div>
              )}
            </div>
            <div className="dialog-footer flex justify-between items-center">
              <a
                href={previewAttachment.dataUrl}
                download={previewAttachment.name}
                className="inline-flex items-center gap-1.5 text-xs text-[#1F3A2E] hover:underline"
              >
                <Download size={13} /> Download File
              </a>
              <Button type="button" onClick={() => setPreviewAttachment(null)}>
                Close Preview
              </Button>
            </div>
          </Modal>
        )}

        {/* MODAL 6: CREATE NEW INCIDENT / WORKFLOW ISSUE */}
        <Modal
          open={createTicketModal}
          onClose={() => setCreateTicketModal(false)}
          title="Open Technical Incident / Workflow Issue"
          description="Log a technical issue or gateway event on behalf of a resort tenant."
          wide
        >
          <form onSubmit={handleCreateTicket} className="flex flex-col flex-1 min-h-0">
            <div className="dialog-body space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="field block">
                  <span className="text-xs font-semibold text-[#1F3A2E]">Resort Tenant *</span>
                  <select
                    value={newTicketTenant}
                    onChange={(e) => setNewTicketTenant(e.target.value)}
                    className="w-full mt-1 p-2.5 border border-[#E9DFCE] rounded-lg text-xs font-mono"
                  >
                    {tenants.map((t) => (
                      <option key={t.code} value={t.code}>
                        [{t.code}] {t.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field block">
                  <span className="text-xs font-semibold text-[#1F3A2E]">Category *</span>
                  <select
                    value={newTicketCategory}
                    onChange={(e) => setNewTicketCategory(e.target.value)}
                    className="w-full mt-1 p-2.5 border border-[#E9DFCE] rounded-lg text-xs"
                  >
                    <option value="PAYMENTS">PAYMENTS (Payment Gateway & Folio)</option>
                    <option value="INTEGRATIONS">INTEGRATIONS (OTA Channel Manager)</option>
                    <option value="INFRASTRUCTURE">INFRASTRUCTURE (Email & Telemetry)</option>
                    <option value="SECURITY">SECURITY (Rate Limiting & Authentication)</option>
                    <option value="SYSTEM">SYSTEM (Workflow & Configuration)</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="field block">
                  <span className="text-xs font-semibold text-[#1F3A2E]">Priority Level *</span>
                  <select
                    value={newTicketPriority}
                    onChange={(e: any) => setNewTicketPriority(e.target.value)}
                    className="w-full mt-1 p-2.5 border border-[#E9DFCE] rounded-lg text-xs font-semibold"
                  >
                    <option value="CRITICAL">CRITICAL (System Blocker)</option>
                    <option value="HIGH">HIGH (Degraded Service)</option>
                    <option value="MEDIUM">MEDIUM (Minor Issue)</option>
                    <option value="LOW">LOW (Cosmetic / Low Impact)</option>
                  </select>
                </label>

                <label className="field block">
                  <span className="text-xs font-semibold text-[#1F3A2E]">Incident Summary *</span>
                  <input
                    type="text"
                    required
                    value={newTicketTitle}
                    onChange={(e) => setNewTicketTitle(e.target.value)}
                    placeholder="e.g. Ingress webhook timeout on folio payments"
                    className="w-full mt-1 p-2.5 border border-[#E9DFCE] rounded-lg text-xs"
                  />
                </label>
              </div>

              <label className="field block">
                <span className="text-xs font-semibold text-[#1F3A2E]">
                  Technical Description *
                </span>
                <textarea
                  rows={4}
                  required
                  value={newTicketDescription}
                  onChange={(e) => setNewTicketDescription(e.target.value)}
                  placeholder="Describe the failure mode, affected tenant shard, or replication steps..."
                  className="w-full mt-1 p-2.5 border border-[#E9DFCE] rounded-lg text-xs"
                />
              </label>
            </div>

            <div className="dialog-footer flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateTicketModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#C9A227] hover:bg-[#B38F1E] text-white">
                Submit Incident Ticket
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PageMotion>
  );
}
