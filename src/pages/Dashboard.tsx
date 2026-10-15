import { findRoom } from '../lib/domain';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Coffee,
  IndianRupee,
  Leaf,
  MessageSquare,
  Plus,
  Sparkles,
  Star,
  Sun,
  Users,
  Waves,
  ShieldCheck,
  Receipt,
  Wrench,
  Utensils,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  UserPlus,
  Gift,
  CreditCard,
  LifeBuoy,
  Paperclip,
  Send,
  FileText,
  X,
  Download,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import HeroSlider from '../components/HeroSlider';
import { AccountsTable } from '../components/AccountsTable';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHead,
  Counter,
  Empty,
  PageMotion,
  PageTitle,
  Modal,
  FormModal,
} from '../components/ui';
import {
  can,
  dashboard,
  dateOffset,
  folio,
  money,
  shortDate,
  today,
  roles,
  serviceMenu,
  type TicketAttachment,
  type PlatformTicket,
} from '../lib/domain';
import { roomStatus, roomStatuses } from '../lib/property';
import { useStore } from '../lib/store';

import { motion, type Variants } from 'framer-motion';

const statVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export function Stat({
  label,
  value,
  icon: Icon,
  detail,
  format,
  color = 'primary',
  onClick,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  detail: string;
  format?: (n: number) => string;
  color?: 'primary' | 'accent' | 'warning' | 'danger' | string;
  onClick?: () => void;
}) {
  const tone = ['amber', 'accent', 'warning'].includes(color)
    ? 'amber'
    : ['rose', 'danger'].includes(color)
      ? 'rose'
      : color;

  return (
    <motion.div
      variants={statVariants}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
    >
      <Card
        className={`stat-card stat-${tone} overflow-hidden relative shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm bg-white/90`}
        style={{ border: '1px solid rgba(220,225,215,0.4)', flex: 1 }}
      >
        {onClick && (
          <button
            className="stat-card-link absolute inset-0 w-full h-full cursor-pointer z-10 opacity-0"
            aria-label={`View ${label.toLowerCase()}`}
            onClick={onClick}
          />
        )}
        <div className="stat-top flex items-center justify-between z-0 relative">
          <span className="font-semibold text-xs tracking-wide uppercase text-gray-500">
            {label}
          </span>
          <div className={`stat-icon ${tone} p-2 rounded-xl bg-opacity-10 backdrop-blur-md`}>
            <Icon size={19} className="opacity-80" />
          </div>
        </div>
        <div className="stat-value mt-3 mb-1 z-0 relative">
          <h3 className="text-3xl font-bold tracking-tight text-gray-900">
            <Counter value={value} format={format} />
          </h3>
        </div>
        <div className="stat-detail flex items-center text-xs text-gray-500 z-0 relative">
          <span
            className="w-1.5 h-1.5 rounded-full mr-2 opacity-70"
            style={{ backgroundColor: 'currentColor' }}
          />
          {detail}
        </div>
        {/* Subtle decorative background glow */}
        <div
          className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-5 pointer-events-none blur-2xl"
          style={{ backgroundColor: 'currentColor' }}
        />
      </Card>
    </motion.div>
  );
}

function CalendarWidget() {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  return (
    <Card className="p-6 h-full shadow-sm border border-[#F0EBE1] bg-white flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0EBE1]">
          <h3 className="font-serif font-bold text-lg text-[#22261F]">
            {today.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <ChevronLeft size={14} />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase mb-2 text-[#6B7160]">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {Array(firstDay)
            .fill(null)
            .map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
          {Array(daysInMonth)
            .fill(null)
            .map((_, i) => (
              <div
                key={i}
                className={`w-7 h-7 flex items-center justify-center rounded-full mx-auto cursor-pointer transition-colors ${i + 1 === today.getDate() ? 'bg-[var(--ocean)] text-white font-bold' : 'text-[#22261F] hover:bg-[#FAF7F2]'}`}
              >
                {i + 1}
              </div>
            ))}
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { actor } = useStore();
  if (actor?.module === 'Guest') return <GuestDashboard />;
  if (actor?.module === 'Staff') return <StaffRoleDashboard />;
  return <OperationsDashboard />;
}

function OperationsDashboard() {
  const reduced = useReducedMotion();
  const { s, actor, act } = useStore();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('7');
  const d = dashboard(s),
    owner = actor!.module === 'Owner',
    base = `/${actor!.module.toLowerCase()}`;
  const periodDays = Number(period);
  const chart = Array.from({ length: periodDays }, (_, i) => {
    const date = dateOffset(i - periodDays + 1);
    return {
      date: shortDate(date),
      revenue: s.payments
        .filter((p) => p.date.slice(0, 10) === date)
        .reduce((n, p) => n + (p.type === 'Refund' ? -p.amount : p.amount), 0),
      bookings: s.reservations.filter((r) => r.checkIn === date).length,
    };
  });
  const chartTotal = chart.reduce((n, p) => n + p.revenue, 0);
  const colors = ['#668f68', '#bd9b47', '#214b40', '#ca9958', '#b46b55', '#7c8791'];
  const roomData = roomStatuses.map((status, i) => ({
    name: status,
    value: s.rooms.filter((r) => roomStatus(s, r) === status).length,
    color: colors[i],
  }));
  const arrivals = s.reservations.filter((r) => r.checkIn === today() && r.status === 'Confirmed');
  const dailyRevenue = s.payments
    .filter((p) => p.date.startsWith(today()))
    .reduce((n, p) => n + (p.type === 'Refund' ? -p.amount : p.amount), 0);
  const average = s.reviews.length
    ? s.reviews.reduce((n, r) => n + r.rating, 0) / s.reviews.length
    : 0;
  const go = (path: string) => navigate(`${base}/${path}`);

  // Owner Support Tickets state
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Technical Issue');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [ticketAttachments, setTicketAttachments] = useState<TicketAttachment[]>([]);
  const [uploadError, setUploadError] = useState('');

  const [ownerTicketsOpen, setOwnerTicketsOpen] = useState(false);
  const [selectedOwnerTicket, setSelectedOwnerTicket] = useState<PlatformTicket | null>(null);
  const [ownerTicketFilter, setOwnerTicketFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('ALL');
  const [ownerReplyMessage, setOwnerReplyMessage] = useState('');
  const [ownerReplyAttachments, setOwnerReplyAttachments] = useState<TicketAttachment[]>([]);
  const [ownerPreviewAttachment, setOwnerPreviewAttachment] = useState<TicketAttachment | null>(null);

  // Tickets belonging to this owner
  const myTickets: PlatformTicket[] = (s.platformTickets ?? []).filter((t) => {
    if (!owner) return false;
    return (
      t.creatorId === actor!.id ||
      t.ownerEmail === actor!.email ||
      t.tenantCode === (actor!.tenantId || 'PALM')
    );
  });
  const activeOwnerTickets = myTickets.filter((t) => t.status !== 'CLOSED');

  // Keep selectedOwnerTicket synchronized with latest state
  const currentSelectedTicket = selectedOwnerTicket
    ? (s.platformTickets ?? []).find((t) => t.id === selectedOwnerTicket.id) || selectedOwnerTicket
    : null;

  const filteredOwnerTickets = myTickets.filter((t) => {
    if (ownerTicketFilter === 'ALL') return true;
    return t.status === ownerTicketFilter;
  });

  const handleAttachmentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isReply = false
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadError('');

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
    const maxSizeBytes = 1_500_000;

    const newAttachments: TicketAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!allowedTypes.includes(file.type)) {
        const msg = `"${file.name}" is not supported. Use PNG, JPG, WebP images or PDF documents.`;
        setUploadError(msg);
        toast.error(msg);
        continue;
      }
      if (file.size > maxSizeBytes) {
        const msg = `"${file.name}" exceeds 1.5 MB limit.`;
        setUploadError(msg);
        toast.error(msg);
        continue;
      }

      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newAttachments.push({
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl,
        });
      } catch {
        toast.error(`Could not read file ${file.name}`);
      }
    }

    if (newAttachments.length > 0) {
      if (isReply) {
        setOwnerReplyAttachments((prev) => [...prev, ...newAttachments]);
      } else {
        setTicketAttachments((prev) => [...prev, ...newAttachments]);
      }
    }

    e.target.value = '';
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle.trim()) {
      toast.error('Ticket title is required.');
      return;
    }
    if (!ticketDescription.trim()) {
      toast.error('Ticket description is required.');
      return;
    }

    const ok = act(
      {
        type: 'ticket.create',
        payload: {
          title: ticketTitle.trim(),
          category: ticketCategory,
          description: ticketDescription.trim(),
          priority: ticketPriority,
          attachments: ticketAttachments,
        },
      },
      'Support ticket submitted successfully to Super Admin',
    );

    if (ok) {
      setCreateTicketOpen(false);
      setTicketTitle('');
      setTicketCategory('Technical Issue');
      setTicketDescription('');
      setTicketPriority('MEDIUM');
      setTicketAttachments([]);
      setUploadError('');
    }
  };

  const handleOwnerReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedTicket || !ownerReplyMessage.trim()) return;

    const ok = act(
      {
        type: 'ticket.update',
        payload: {
          id: currentSelectedTicket.id,
          reply: ownerReplyMessage.trim(),
          replyAttachments: ownerReplyAttachments,
        },
      },
      'Reply sent to Super Admin',
    );

    if (ok) {
      setOwnerReplyMessage('');
      setOwnerReplyAttachments([]);
    }
  };

  const handleOwnerCloseTicket = (ticketId: string) => {
    act(
      {
        type: 'ticket.update',
        payload: {
          id: ticketId,
          status: 'CLOSED',
        },
      },
      'Ticket marked as Closed',
    );
  };

  return (
    <PageMotion>
      <PageTitle
        eyebrow={new Date()
          .toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
          .toUpperCase()}
        title={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, ${actor!.name.split(' ')[0]}`}
        description={
          owner
            ? 'Executive overview of performance, financials, and account management.'
            : 'Here’s what’s happening at your resort today.'
        }
        actions={
          <>
            <Button variant="outline" onClick={() => go('reports?period=Daily')}>
              <CalendarDays size={16} />
              Today
              <ChevronRight size={14} />
            </Button>
            {owner && (
              <>
                <Button
                  onClick={() => setCreateTicketOpen(true)}
                  className="bg-[#1F3A2E] hover:bg-[#2B4C3E] text-white flex items-center gap-1.5 shadow-xs font-semibold text-xs"
                >
                  <LifeBuoy size={15} className="text-[#C9A227]" />
                  Create Ticket
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setOwnerTicketsOpen(true)}
                  className="flex items-center gap-1.5 text-xs relative"
                >
                  <MessageSquare size={14} />
                  My Tickets
                  {activeOwnerTickets.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-[#C9A227] text-white font-bold text-[10px] rounded-full">
                      {activeOwnerTickets.length}
                    </span>
                  )}
                </Button>
              </>
            )}
            {can(s, actor!, 'reservations') && !owner && (
              <Button onClick={() => go('reservations?new=1')}>
                <Plus size={17} />
                New reservation
              </Button>
            )}
            {owner && (
              <Button onClick={() => go('reports')}>
                <BarIcon />
                View reports
              </Button>
            )}
          </>
        }
      />

      <HeroSlider
        resortName={s.policies.resortName}
        location={s.policies.location}
        onExplore={() => go('rooms')}
      />

      {/* Core Executive & Operational Stats */}
      <motion.div
        className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 mb-8"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
      >
        <Stat
          label="Room occupancy"
          onClick={() => go('rooms?status=Occupied')}
          value={d.occupancy}
          format={(n) => `${n}%`}
          icon={BedDouble}
          detail={`${d.occupied} of ${s.rooms.length} rooms occupied`}
          color="primary"
        />
        <Stat
          label={owner ? 'Total collected' : 'Available rooms'}
          onClick={() => go(owner ? 'billing' : 'rooms?status=Available')}
          value={owner ? d.revenue : d.available}
          format={owner ? money : undefined}
          icon={owner ? IndianRupee : CalendarDays}
          detail={owner ? 'Net payments after refunds' : 'Inspected and ready to welcome'}
          color="amber"
        />
        <Stat
          label={owner ? 'Operating expenses' : 'Today’s revenue'}
          onClick={() => go('billing')}
          value={owner ? d.expenses : dailyRevenue}
          format={money}
          icon={IndianRupee}
          detail={owner ? 'Recorded expenses across the resort' : 'Net collections recorded today'}
          color="primary"
        />
        <Stat
          label={owner ? 'Cancellation rate' : 'Today’s arrivals'}
          onClick={() => go(owner ? 'reports' : 'reservations?tab=Arrivals')}
          value={
            owner
              ? Math.round(
                  (s.reservations.filter((r) => r.status === 'Cancelled').length /
                    Math.max(1, s.reservations.length)) *
                    100,
                )
              : d.arrivals
          }
          format={owner ? (n) => `${n}%` : undefined}
          icon={owner ? CalendarDays : Users}
          detail={
            owner
              ? `${s.reservations.length} total reservations`
              : `${d.departures} departures scheduled today`
          }
          color="rose"
        />
      </motion.div>

      <motion.div
        className="dashboard-shortcuts flex flex-wrap gap-3 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            className="shadow-sm border-gray-200/60 bg-white/70 backdrop-blur-md"
            onClick={() => go('rooms?status=Maintenance')}
          >
            <Wrench size={15} />
            Maintenance · {s.rooms.filter((r) => roomStatus(s, r) === 'Maintenance').length}
          </Button>
        </motion.div>
        {can(s, actor!, 'amenities') && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              className="shadow-sm border-gray-200/60 bg-white/70 backdrop-blur-md"
              onClick={() => go('amenities')}
            >
              <Waves size={15} />
              Amenities · {s.amenities.length}
            </Button>
          </motion.div>
        )}
        {!owner && can(s, actor!, 'guests') && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              className="shadow-sm border-gray-200/60 bg-white/70 backdrop-blur-md"
              onClick={() => go('guests')}
            >
              <Users size={15} />
              Guests · {s.guests.length}
            </Button>
          </motion.div>
        )}
        {(owner || can(s, actor!, 'team')) && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              className="shadow-sm border-gray-200/60 bg-white/70 backdrop-blur-md"
              onClick={() => go(owner ? 'accounts' : 'team')}
            >
              <Users size={15} />
              Team · {s.accounts.filter((a) => a.module === 'Staff' && a.active).length}
            </Button>
          </motion.div>
        )}
      </motion.div>
      <div className="dashboard-middle grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="revenue-card h-full flex flex-col shadow-sm border border-[#F0EBE1] bg-white">
            <CardHead
              title="Revenue overview"
              subtitle="A clear view of your daily net collections"
              action={
                <select
                  className="compact-select border border-[#F0EBE1] rounded-lg px-2 py-1 text-xs"
                  aria-label="Revenue period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="7">Last 7 days</option>
                  <option value="14">Last 14 days</option>
                  <option value="30">Last 30 days</option>
                </select>
              }
            />
            <div className="chart-summary p-4 flex items-center justify-between border-b border-[#F0EBE1]">
              <div>
                <span className="text-2xl font-bold font-serif text-[#22261F]">
                  {money(chartTotal)}
                </span>
                <span className="text-xs text-[#6B7160] block">
                  Net collections ({period} days)
                </span>
              </div>
              <span className="text-xs text-[#6B7160]">
                {shortDate(dateOffset(1 - periodDays))} – {shortDate(today())}
              </span>
            </div>
            <div className="revenue-chart h-64 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#44796A" stopOpacity={0.24} />
                      <stop offset="100%" stopColor="#44796A" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#F0EBE1" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#6B7160' }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#6B7160' }}
                    tickFormatter={(v) => (v >= 1000 ? `₹${v / 1000}k` : `₹${v}`)}
                    width={48}
                  />
                  <Tooltip
                    formatter={(value) => [money(Number(value)), 'Collections']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #F0EBE1', fontSize: 12 }}
                  />
                  <Area
                    isAnimationActive={!reduced}
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1F3A2E"
                    strokeWidth={2.5}
                    fill="url(#revenue-fill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Card className="room-overview h-full shadow-sm border border-[#F0EBE1] bg-white">
            <CardHead
              title="Rooms at a glance"
              subtitle="Current availability across your resort"
              action={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="View room availability"
                  onClick={() => go('rooms')}
                >
                  <ArrowUpRight size={18} />
                </Button>
              }
            />
            <div className="donut-wrap flex flex-col items-center justify-center p-4 relative">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    isAnimationActive={!reduced}
                    data={roomData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={78}
                    paddingAngle={4}
                    stroke="none"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {roomData.map((r) => (
                      <Cell key={r.name} fill={r.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v} rooms`, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-label text-center absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <strong className="text-3xl font-serif font-bold block mt-6 text-[#22261F]">
                  {s.rooms.length}
                </strong>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#6B7160]">
                  Total
                </span>
              </div>
            </div>
            <div className="room-legend p-5 border-t border-[#F0EBE1] grid grid-cols-2 gap-3 text-xs">
              {roomData.map((r) => (
                <div key={r.name} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shadow-sm"
                    style={{ background: r.color }}
                  />
                  <span className="text-[#6B7160] flex-1 font-medium">{r.name}</span>
                  <strong className="font-mono text-[#22261F]">{r.value}</strong>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          className="lg:col-span-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="shadow-sm border border-[#F0EBE1] bg-white h-full">
            <CardHead
              title={owner ? 'Recent reservations' : 'Today’s arrivals'}
              subtitle={
                owner
                  ? 'Latest guest bookings across the resort'
                  : 'Welcoming today’s confirmed arrivals'
              }
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => go(owner ? 'recent-reservations' : 'arrivals')}
                >
                  View all <ArrowRight size={14} />
                </Button>
              }
            />
            <div className="table-scroll">
              <table className="arrival-table w-full text-xs text-left">
                <thead className="bg-[#FAF7F2] text-[#6B7160]">
                  <tr>
                    <th className="p-3">Guest</th>
                    <th className="p-3">Room</th>
                    <th className="p-3">Dates</th>
                    <th className="p-3">Status</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE1]">
                  {(owner ? s.reservations.slice(0, 5) : arrivals).map((r) => {
                    const g = s.guests.find((g) => g.id === r.guestId)!,
                      room = findRoom(s, r.roomId)!;
                    return (
                      <tr key={r.id} className="hover:bg-[#FAF7F2]/50">
                        <td className="p-3">
                          <div className="person-cell flex items-center gap-2">
                            <Avatar name={g.name} />
                            <div>
                              <strong className="block text-[#22261F]">{g.name}</strong>
                              <small className="text-[#6B7160]">{r.id}</small>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <strong className="block text-[#22261F]">Room {room.number}</strong>
                          <small className="text-[#6B7160]">{room.type}</small>
                        </td>
                        <td className="p-3 text-[#22261F]">
                          {shortDate(r.checkIn)} – {shortDate(r.checkOut)}
                          <small className="block text-[#6B7160]">{r.adults} guests</small>
                        </td>
                        <td className="p-3">
                          <Badge>{r.status}</Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`View ${g.name} reservation`}
                            onClick={() => go(owner ? 'reports' : `reservations/${r.id}`)}
                          >
                            <ArrowUpRight size={17} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Card className="attention-card h-full bg-gradient-to-br from-white to-[#FAF7F2]/50 shadow-sm border border-[#F0EBE1]">
            <CardHead title="Attention needed" subtitle="Action items requiring staff attention" />
            <div className="space-y-3 mt-3">
              <button
                onClick={() => go(owner ? 'reports' : 'tasks')}
                className="w-full p-3 rounded-xl border border-[#F0EBE1] hover:border-[#C9A227] flex items-center justify-between text-left transition-all bg-[#FAF7F2]/60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D98E04]/10 text-[#D98E04] flex items-center justify-center">
                    <ClipboardCheck size={18} />
                  </div>
                  <div>
                    <strong className="block text-xs text-[#22261F]">Open tasks</strong>
                    <span className="text-[11px] text-[#6B7160]">Housekeeping & Maintenance</span>
                  </div>
                </div>
                <span className="font-bold text-xs bg-[#D98E04]/20 text-[#D98E04] px-2 py-0.5 rounded-full">
                  {d.pending}
                </span>
              </button>

              <button
                onClick={() => go(owner ? 'reports' : 'support')}
                className="w-full p-3 rounded-xl border border-[#F0EBE1] hover:border-[#C9A227] flex items-center justify-between text-left transition-all bg-[#FAF7F2]/60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#C1443A]/10 text-[#C1443A] flex items-center justify-center">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <strong className="block text-xs text-[#22261F]">Guest requests</strong>
                    <span className="text-[11px] text-[#6B7160]">Concierge & Support tickets</span>
                  </div>
                </div>
                <span className="font-bold text-xs bg-[#C1443A]/20 text-[#C1443A] px-2 py-0.5 rounded-full">
                  {d.complaints}
                </span>
              </button>

              <div className="guest-love p-4 rounded-xl bg-[var(--ocean)] text-white flex items-center justify-between mt-4">
                <div>
                  <div className="flex items-center gap-1 text-[#C9A227]">
                    <Star size={16} fill="currentColor" />
                    <span className="font-bold font-serif text-lg">{average.toFixed(1)} / 5</span>
                  </div>
                  <p className="text-xs text-white/80 mt-0.5">Overall guest feedback score</p>
                </div>
                <Leaf size={28} className="text-[#C9A227] opacity-80" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <CalendarWidget />
        </motion.div>
      </div>
      <AccountsTable
        title={owner ? 'Management team' : 'Your resort team'}
        subtitle={
          owner
            ? 'Manage manager accounts and workspace access.'
            : 'Staff accounts, roles, and access in one place.'
        }
      />
      {/* Owner Support Tickets Dashboard Section */}
      {owner && (
        <Card className="mt-6 mb-2 border border-[#E9DFCE] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-[#F0EBE1]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#1F3A2E]/10 text-[#1F3A2E] rounded-lg">
                <LifeBuoy size={18} className="text-[#C9A227]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-[#1F3A2E]">
                  Super Admin Support & Escalations
                </h3>
                <p className="text-xs text-[#6B7160]">
                  Direct communication channel with Super Admin platform engineering
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setOwnerTicketsOpen(true)}
                className="text-xs flex items-center gap-1.5"
              >
                <MessageSquare size={13} />
                View All ({myTickets.length})
              </Button>
              <Button
                size="sm"
                onClick={() => setCreateTicketOpen(true)}
                className="bg-[#1F3A2E] hover:bg-[#2B4C3E] text-white text-xs flex items-center gap-1.5"
              >
                <Plus size={13} />
                Create Ticket
              </Button>
            </div>
          </div>

          {myTickets.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#6B7160] space-y-2">
              <p>No support tickets opened yet. If you encounter any technical issues or need system adjustments, submit a ticket to the Super Admin.</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCreateTicketOpen(true)}
                className="text-xs inline-flex items-center gap-1.5 mt-2"
              >
                <LifeBuoy size={14} className="text-[#C9A227]" />
                Open First Ticket
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-[#F0EBE1] mt-2">
              {myTickets.slice(0, 3).map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => {
                    setSelectedOwnerTicket(ticket);
                    setOwnerTicketsOpen(true);
                  }}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-[#FAF7F2] -mx-2 px-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs font-bold text-[#1F3A2E]">{ticket.id}</span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.2 rounded ${
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
                      <span className="text-[11px] text-[#6B7160]">· {ticket.category}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-[#1F3A2E] truncate">{ticket.title}</h4>
                    <p className="text-[11px] text-[#6B7160] truncate">{ticket.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {ticket.replies && ticket.replies.length > 0 && (
                      <span className="text-[11px] text-[#6B7160] flex items-center gap-1 hidden sm:inline-flex">
                        <MessageSquare size={12} className="text-[#C9A227]" />
                        {ticket.replies.length}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
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
                    <ChevronRight size={14} className="text-[#6B7160]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* CREATE SUPPORT TICKET MODAL */}
      <Modal
        open={createTicketOpen}
        onClose={() => setCreateTicketOpen(false)}
        title="Create Support Ticket"
        description="Submit a technical request, issue report, or system inquiry directly to the Super Admin."
        wide
      >
        <form onSubmit={handleCreateTicketSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="dialog-body space-y-4">
            {/* Owner & Super Admin Assignment Banner */}
            <div className="p-3 bg-gradient-to-r from-[#FAF7F2] to-[#F5EFE6] border border-[#E9DFCE] rounded-xl flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[#6B7160]">
                  Requester: <strong className="text-[#1F3A2E]">{actor!.name}</strong> ({actor!.email})
                </span>
                <span className="text-[#6B7160]">· Resort: <strong className="text-[#1F3A2E]">{actor!.tenantId || 'PALM'}</strong></span>
              </div>
              <div className="text-[11px] font-semibold text-[#1F3A2E] bg-white/80 px-2.5 py-1 rounded-md border border-[#E9DFCE]">
                Assigned to: Platform Administrator (Super Admin)
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-[#1F3A2E] mb-1.5">
                Ticket Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
                placeholder="e.g. Folio payment gateway timeout on guest checkout"
                className="w-full px-3 py-2.5 bg-white border border-[#E9DFCE] rounded-xl text-xs placeholder:text-[#6B7160]/50 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none"
              />
            </div>

            {/* Category and Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F3A2E] mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#E9DFCE] rounded-xl text-xs font-medium focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none"
                >
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Bug/Error">Bug/Error</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Data Correction">Data Correction</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F3A2E] mb-1.5">
                  Priority Level <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={ticketPriority}
                  onChange={(e: any) => setTicketPriority(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#E9DFCE] rounded-xl text-xs font-medium focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium (Default)</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#1F3A2E] mb-1.5">
                Issue Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                placeholder="Provide comprehensive details about the issue, replication steps, affected room/guest folios, or requested system behavior..."
                className="w-full px-3 py-2.5 bg-white border border-[#E9DFCE] rounded-xl text-xs placeholder:text-[#6B7160]/50 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none"
              />
            </div>

            {/* Optional Screenshots / Document Uploads */}
            <div>
              <label className="block text-xs font-semibold text-[#1F3A2E] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Paperclip size={14} className="text-[#C9A227]" />
                  Screenshots & Attachments (Optional)
                </span>
                <span className="text-[11px] font-normal text-[#6B7160]">
                  PNG, JPG, WebP, PDF · Max 1.5 MB each
                </span>
              </label>

              <div className="p-3 bg-[#FAF7F2] border border-dashed border-[#E9DFCE] rounded-xl space-y-3">
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-[#E9DFCE] hover:border-[#C9A227] rounded-lg text-xs font-semibold text-[#1F3A2E] cursor-pointer transition-colors shadow-2xs">
                  <Upload size={15} className="text-[#C9A227]" />
                  <span>Choose screenshots or documents</span>
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    onChange={(e) => handleAttachmentUpload(e, false)}
                    className="hidden"
                  />
                </label>

                {uploadError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                    {uploadError}
                  </p>
                )}

                {/* Previews */}
                {ticketAttachments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {ticketAttachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-[#E9DFCE] text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {att.type.startsWith('image/') ? (
                            <img
                              src={att.dataUrl}
                              alt={att.name}
                              className="w-8 h-8 rounded object-cover border border-[#E9DFCE] shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shrink-0">
                              <FileText size={16} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="block truncate font-medium text-[11px] text-[#1F3A2E]">
                              {att.name}
                            </span>
                            <span className="block text-[10px] text-[#6B7160]">
                              {(att.size / 1024).toFixed(0)} KB
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setTicketAttachments((prev) => prev.filter((a) => a.id !== att.id))
                          }
                          className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors"
                          title="Remove attachment"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="dialog-footer flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setCreateTicketOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1F3A2E] hover:bg-[#2B4C3E] text-white">
              Submit Support Ticket
            </Button>
          </div>
        </form>
      </Modal>

      {/* OWNER TICKETS TRACKER MODAL */}
      <Modal
        open={ownerTicketsOpen}
        onClose={() => {
          setOwnerTicketsOpen(false);
          setSelectedOwnerTicket(null);
        }}
        title={
          currentSelectedTicket
            ? `Ticket #${currentSelectedTicket.id}: ${currentSelectedTicket.title}`
            : 'Your Support Tickets'
        }
        description={
          currentSelectedTicket
            ? `Category: ${currentSelectedTicket.category} · Priority: ${currentSelectedTicket.priority} · Status: ${currentSelectedTicket.status}`
            : 'Track active inquiries, Super Admin replies, and engineering resolution updates.'
        }
        wide
      >
        <div className="dialog-body space-y-4">
          {currentSelectedTicket ? (
            /* TICKET DETAIL VIEW */
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-[#F0EBE1] pb-3">
                <button
                  type="button"
                  onClick={() => setSelectedOwnerTicket(null)}
                  className="text-xs font-semibold text-[#1F3A2E] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={14} /> Back to all tickets
                </button>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      currentSelectedTicket.status === 'CLOSED'
                        ? 'bg-slate-100 text-slate-700 border-slate-300'
                        : currentSelectedTicket.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : currentSelectedTicket.status === 'IN_PROGRESS'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-blue-100 text-blue-800 border-blue-300'
                    }`}
                  >
                    {currentSelectedTicket.status}
                  </span>
                  {currentSelectedTicket.status !== 'CLOSED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOwnerCloseTicket(currentSelectedTicket.id)}
                      className="text-xs text-slate-600 hover:text-slate-900 border-slate-300"
                    >
                      Close Ticket
                    </Button>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E9DFCE] text-xs space-y-1">
                <div className="flex items-center justify-between text-[#6B7160]">
                  <span className="font-semibold text-[#1F3A2E]">Initial Problem Statement:</span>
                  <span>{new Date(currentSelectedTicket.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-[#22261F] leading-relaxed whitespace-pre-line">
                  {currentSelectedTicket.description}
                </p>
              </div>

              {/* Attachments */}
              {currentSelectedTicket.attachments && currentSelectedTicket.attachments.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-[#1F3A2E] flex items-center gap-1.5">
                    <Paperclip size={13} className="text-[#C9A227]" />
                    Original Attachments ({currentSelectedTicket.attachments.length}):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {currentSelectedTicket.attachments.map((att) => (
                      <button
                        key={att.id}
                        type="button"
                        onClick={() => setOwnerPreviewAttachment(att)}
                        className="flex items-center gap-2 p-2 bg-white hover:bg-[#FAF7F2] border border-[#E9DFCE] rounded-lg text-left text-xs transition-colors cursor-pointer group"
                      >
                        {att.type.startsWith('image/') ? (
                          <img
                            src={att.dataUrl}
                            alt={att.name}
                            className="w-8 h-8 rounded object-cover border border-[#E9DFCE] shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shrink-0">
                            <FileText size={16} />
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

              {/* Resolution Notes from Super Admin */}
              {Boolean(currentSelectedTicket.resolutionNotes?.trim()) && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                  <strong className="text-emerald-900 block font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-700" />
                    Super Admin Engineering Resolution:
                  </strong>
                  <p className="text-emerald-800 leading-relaxed font-sans">
                    {currentSelectedTicket.resolutionNotes}
                  </p>
                </div>
              )}

              {/* Conversation & Replies Thread */}
              <div className="space-y-2.5 border-t border-[#F0EBE1] pt-3">
                <span className="text-xs font-semibold text-[#1F3A2E] flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-[#C9A227]" />
                  Replies & Discussion ({currentSelectedTicket.replies?.length || 0}):
                </span>

                {(!currentSelectedTicket.replies || currentSelectedTicket.replies.length === 0) ? (
                  <p className="text-xs text-[#6B7160] italic py-2">
                    No replies yet. The Super Admin has received your ticket and will update you shortly.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {currentSelectedTicket.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={`p-3 rounded-lg text-xs space-y-1 ${
                          reply.senderRole === 'SUPER_ADMIN'
                            ? 'bg-emerald-50/70 border border-emerald-200/80 mr-4'
                            : 'bg-[#FAF7F2] border border-[#E9DFCE] ml-4'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-[#1F3A2E] flex items-center gap-1">
                            {reply.senderName}
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                reply.senderRole === 'SUPER_ADMIN'
                                  ? 'bg-emerald-200 text-emerald-900'
                                  : 'bg-[#1F3A2E]/10 text-[#1F3A2E]'
                              }`}
                            >
                              {reply.senderRole === 'SUPER_ADMIN' ? 'Super Admin' : 'You (Owner)'}
                            </span>
                          </strong>
                          <span className="text-[#6B7160] text-[10px]">
                            {new Date(reply.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[#22261F] leading-relaxed whitespace-pre-line">{reply.message}</p>
                        {reply.attachments && reply.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {reply.attachments.map((att) => (
                              <button
                                key={att.id}
                                type="button"
                                onClick={() => setOwnerPreviewAttachment(att)}
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
                )}

                {/* Reply Composer for Owner */}
                {currentSelectedTicket.status !== 'CLOSED' ? (
                  <form onSubmit={handleOwnerReplySubmit} className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold text-[#1F3A2E]">
                      Post a reply to Super Admin
                    </label>
                    <textarea
                      rows={2}
                      value={ownerReplyMessage}
                      onChange={(e) => setOwnerReplyMessage(e.target.value)}
                      placeholder="Type a message or provide additional details..."
                      className="w-full px-3 py-2 bg-white border border-[#E9DFCE] rounded-xl text-xs placeholder:text-[#6B7160]/50 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none"
                    />

                    {/* Previews for reply attachments */}
                    {ownerReplyAttachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {ownerReplyAttachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center gap-1.5 px-2 py-1 bg-white border border-[#E9DFCE] rounded text-[11px]"
                          >
                            <span className="truncate max-w-[120px]">{att.name}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setOwnerReplyAttachments((prev) => prev.filter((a) => a.id !== att.id))
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <label className="inline-flex items-center gap-1.5 text-xs text-[#6B7160] hover:text-[#1F3A2E] cursor-pointer">
                        <Paperclip size={14} className="text-[#C9A227]" />
                        <span>Attach file</span>
                        <input
                          type="file"
                          multiple
                          accept="image/png,image/jpeg,image/webp,application/pdf"
                          onChange={(e) => handleAttachmentUpload(e, true)}
                          className="hidden"
                        />
                      </label>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!ownerReplyMessage.trim()}
                        className="bg-[#1F3A2E] hover:bg-[#2B4C3E] text-white text-xs flex items-center gap-1"
                      >
                        <Send size={12} /> Send Reply
                      </Button>
                    </div>
                  </form>
                ) : (
                  <p className="text-xs text-[#6B7160] italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    This ticket is closed. If you require further assistance on this issue, you can create a new ticket.
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* TICKET LIST VIEW */
            <div className="space-y-3">
              {/* Filter tabs */}
              <div className="flex items-center gap-1.5 border-b border-[#F0EBE1] pb-2 overflow-x-auto">
                {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((st) => {
                  const isActive = ownerTicketFilter === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOwnerTicketFilter(st)}
                      className={`ticket-filter-pill px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        isActive ? 'active' : ''
                      }`}
                      style={{
                        backgroundColor: isActive ? '#1F3A2E' : '#FAF7F2',
                        color: isActive ? '#ffffff' : '#37433B',
                        borderColor: isActive ? '#1F3A2E' : '#E2D7C5',
                      }}
                    >
                      {st === 'ALL'
                        ? `All (${myTickets.length})`
                        : st === 'OPEN'
                          ? `Open (${myTickets.filter((t) => t.status === 'OPEN').length})`
                          : st === 'IN_PROGRESS'
                            ? `In Progress (${myTickets.filter((t) => t.status === 'IN_PROGRESS').length})`
                            : st === 'RESOLVED'
                              ? `Resolved (${myTickets.filter((t) => t.status === 'RESOLVED').length})`
                              : `Closed (${myTickets.filter((t) => t.status === 'CLOSED').length})`}
                    </button>
                  );
                })}
              </div>

              {filteredOwnerTickets.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#6B7160]">
                  <p>No tickets match the selected status.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {filteredOwnerTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedOwnerTicket(ticket)}
                      className="p-3.5 bg-[#FAF7F2] hover:bg-white border border-[#E9DFCE] hover:border-[#C9A227] rounded-xl transition-all cursor-pointer space-y-2 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono text-xs font-bold text-[#1F3A2E]">{ticket.id}</span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.2 rounded ${
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
                            <span className="text-[11px] text-[#6B7160]">· {ticket.category}</span>
                            <span className="text-[11px] text-[#6B7160]">
                              · {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-[#1F3A2E]">{ticket.title}</h4>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
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

                      <p className="text-xs text-[#6B7160] line-clamp-2 leading-relaxed">
                        {ticket.description}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-[#6B7160] pt-1 border-t border-[#F0EBE1]">
                        <span className="flex items-center gap-1">
                          <Paperclip size={12} className="text-[#C9A227]" />
                          {ticket.attachments?.length || 0} attachment(s)
                        </span>
                        <span className="flex items-center gap-1 text-[#1F3A2E] font-medium">
                          <MessageSquare size={12} className="text-[#C9A227]" />
                          {ticket.replies?.length || 0} replies · Click to open →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="dialog-footer flex justify-end items-center">
          <Button
            type="button"
            onClick={() => {
              setOwnerTicketsOpen(false);
              setSelectedOwnerTicket(null);
            }}
          >
            Close
          </Button>
        </div>
      </Modal>

      {/* OWNER ATTACHMENT PREVIEW MODAL */}
      {ownerPreviewAttachment && (
        <Modal
          open={!!ownerPreviewAttachment}
          onClose={() => setOwnerPreviewAttachment(null)}
          title={ownerPreviewAttachment.name}
          description={`${ownerPreviewAttachment.type} · ${(ownerPreviewAttachment.size / 1024).toFixed(0)} KB`}
          wide
        >
          <div className="dialog-body flex flex-col items-center justify-center p-4">
            {ownerPreviewAttachment.type.startsWith('image/') ? (
              <img
                src={ownerPreviewAttachment.dataUrl}
                alt={ownerPreviewAttachment.name}
                className="max-h-[500px] w-auto rounded-lg shadow-md object-contain border border-[#E9DFCE]"
              />
            ) : (
              <div className="text-center p-8 space-y-3">
                <FileText size={48} className="mx-auto text-amber-600" />
                <p className="text-sm font-semibold text-[#1F3A2E]">{ownerPreviewAttachment.name}</p>
                <p className="text-xs text-[#6B7160]">PDF Document</p>
                <a
                  href={ownerPreviewAttachment.dataUrl}
                  download={ownerPreviewAttachment.name}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F3A2E] text-white rounded-lg text-xs font-semibold hover:bg-[#2B4C3E]"
                >
                  <Download size={14} /> Download Document
                </a>
              </div>
            )}
          </div>
          <div className="dialog-footer flex justify-between items-center">
            <a
              href={ownerPreviewAttachment.dataUrl}
              download={ownerPreviewAttachment.name}
              className="inline-flex items-center gap-1.5 text-xs text-[#1F3A2E] hover:underline"
            >
              <Download size={13} /> Download File
            </a>
            <Button type="button" onClick={() => setOwnerPreviewAttachment(null)}>
              Close Preview
            </Button>
          </div>
        </Modal>
      )}
    </PageMotion>
  );
}

function BarIcon() {
  return <IndianRupee size={16} />;
}

/* Status Chip Component for Guest Dashboard */
function StatusChip({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Checked in': 'bg-[#1F3A2E]/10 text-[#1F3A2E] border-[#1F3A2E]/25',
    'In progress': 'bg-[#D98E04]/10 text-[#D98E04] border-[#D98E04]/25',
    Scheduled: 'bg-[#2E7D4F]/10 text-[#2E7D4F] border-[#2E7D4F]/25',
    Completed: 'bg-[#1F3A2E]/10 text-[#1F3A2E] border-[#1F3A2E]/25',
    Confirmed: 'bg-[#C9A227]/10 text-[#C9A227] border-[#C9A227]/25',
    Pending: 'bg-[#D98E04]/10 text-[#D98E04] border-[#D98E04]/25',
  };
  const style = styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

/* Guest Portal Dashboard with Luxury Editorial UI & Interactive Steppers */
function GuestDashboard() {
  const { s, actor, act } = useStore();
  const navigate = useNavigate();
  const [pulseGold, setPulseGold] = useState(false);

  const g = s.guests.find((x) => x.id === actor!.guestId);
  if (!g)
    return (
      <Empty
        title="Guest profile unavailable"
        description="Please contact reception for assistance."
      />
    );
  const r =
    s.reservations.find((x) => x.guestId === g.id && x.status === 'Checked in') ??
    s.reservations.find((x) => x.guestId === g.id && x.status === 'Confirmed') ??
    s.reservations
      .filter((x) => x.guestId === g.id)
      .sort((a, b) => b.checkIn.localeCompare(a.checkIn))[0];
  if (!r)
    return (
      <>
        <PageTitle
          title={`Welcome home, ${g.name.split(' ')[0]}.`}
          description="Your confirmed stay will appear here."
        />
        <Empty
          title="No stay yet"
          action={<Button onClick={() => navigate('/guest/support')}>Contact reception</Button>}
        />
      </>
    );
  const room = findRoom(s, r?.roomId);
  const balance = r ? folio(s, r).balance : 0;

  // Booking Progress calculation
  let progressStep = 2; // Default Active Stay
  if (r?.status === 'Confirmed') progressStep = 1;
  if (r?.status === 'Checked in') progressStep = 2;
  if (r?.status === 'Completed') progressStep = 3;

  const triggerGoldPulse = () => {
    setPulseGold(true);
    setTimeout(() => setPulseGold(false), 1000);
  };

  const handleQuickRequest = (title: string, type: string) => {
    act(
      {
        type: 'complaint.create',
        payload: {
          guestId: g.id,
          roomId: room?.id ?? 'room-1',
          category: type,
          subject: title,
          description: `Guest requested ${title} from Guest Dashboard.`,
        },
      },
      `Request logged: ${title}. Our concierge team is on it!`,
    );
  };

  const experiences = serviceMenu
    .filter((item) => item.category !== 'Laundry')
    .map((item) => ({
      id: item.name,
      title: item.name,
      subtitle: item.description,
      duration: 'Per service',
      price: money(item.amount),
      image: item.category === 'Activities' ? '/images/resort.jpg' : '/images/suite.jpg',
      category: item.category,
    }));
  const recentRequests = s.complaints
    .filter((request) => request.guestId === g.id)
    .slice(0, 3)
    .map((request) => ({
      id: request.id,
      service: request.subject,
      time: shortDate(request.date),
      status: request.status,
      category: request.category,
    }));
  const dailySchedule = [
    {
      time: '08:30 AM',
      title: 'Sunrise Beachfront Yoga & Meditation',
      location: 'Beach Pavilion',
      icon: Sun,
    },
    {
      time: '01:00 PM',
      title: 'Gourmet Poolside Grill & Live DJ',
      location: 'The Lagoon Bar',
      icon: Utensils,
    },
    {
      time: '05:30 PM',
      title: 'Sunset Catamaran Champagne Cruise',
      location: 'Private Marina',
      icon: Waves,
    },
    {
      time: '08:00 PM',
      title: 'Live Jazz Night & Artisanal Cocktail Tasting',
      location: 'The Palm Lounge',
      icon: Coffee,
    },
  ];

  return (
    <PageMotion>
      <PageTitle
        eyebrow="GUEST PORTAL · LUXURY RESORT EXPERIENCE"
        title={`Welcome home, ${g.name.split(' ')[0]}.`}
        description="Your stay, experiences, billing, and concierge at your fingertips."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/guest/reservations')}>
              <CalendarDays size={16} />
              My Bookings
            </Button>
            <Button onClick={() => navigate('/guest/support')}>
              <MessageSquare size={16} />
              Ask Concierge
            </Button>
          </>
        }
      />

      {/* Hero Banner: Luxury Editorial Style */}
      <div className="resort-banner guest-banner group relative overflow-hidden bg-[#183843]">
        <img
          src="/images/resort.jpg"
          alt="Resort"
          className="absolute inset-0 w-full h-full object-cover object-[center_45%] group-hover:scale-105 transition-transform duration-700 z-0"
        />
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              'linear-gradient(90deg, #183843f5 0%, #183843db 33%, #18384361 68%, #1838431c 100%)',
          }}
        />
        <div className="banner-content relative z-20">
          <div className="guest-banner-kicker">
            <Sparkles size={13} />
            <span>EXCEPTIONAL STAYS · BRIGHTER TOMORROWS</span>
          </div>
          <h2>Somewhere between a getaway and a feeling.</h2>
          <p>
            Welcome to {s.policies.resortName}. Experience personalized concierge services, fine
            dining, restorative spa treatments, and unforgettable coastal moments.
          </p>
          <div className="guest-banner-actions">
            <Button onClick={() => navigate('/guest/services')}>
              Explore your experiences <ArrowUpRight size={17} />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/guest/support')}
              className="!text-white border-white/30 hover:bg-white/10 hover:border-white"
            >
              Chat with Concierge
            </Button>
          </div>
        </div>
      </div>

      {/* Booking Status Stepper with Status Chips */}
      <Card className="p-6 mb-8 border border-[#F0EBE1] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#F0EBE1]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-xl text-[#22261F]">My Booking Status</h3>
              <StatusChip status={r?.status ?? 'Checked in'} />
            </div>
            <p className="text-xs text-[#6B7160] mt-1">
              Reservation ID: <strong className="font-mono text-[#22261F]">{r.id}</strong> ·{' '}
              {room?.type ?? 'Suite'} (Room {room?.number ?? '101'})
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/guest/reservations/${r.id}`)}
          >
            View Reservation <ChevronRight size={15} />
          </Button>
        </div>

        {/* New 3-Step Progress Format (Card Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Step 1: Upcoming */}
          <div
            className={`flex flex-col p-4 rounded-xl border transition-all ${progressStep >= 1 ? 'bg-[#FAF7F2] border-[#C9A227]/40 shadow-sm' : 'bg-white border-[#F0EBE1] opacity-60'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${progressStep >= 1 ? 'bg-[#C9A227] text-white shadow-md' : 'bg-[#F0EBE1] text-[#6B7160]'}`}
              >
                1
              </div>
              <StatusChip status="Confirmed" />
            </div>
            <strong
              className={
                progressStep >= 1
                  ? 'text-[#1F3A2E] text-sm font-semibold'
                  : 'text-[#6B7160] text-sm'
              }
            >
              Upcoming Stay
            </strong>
            <span className="text-xs text-[#6B7160] mt-1">{shortDate(r.checkIn)}</span>
          </div>

          {/* Step 2: Active */}
          <div
            className={`flex flex-col p-4 rounded-xl border transition-all ${progressStep >= 2 ? 'bg-[#FAF7F2] border-[#C9A227]/40 shadow-sm' : 'bg-white border-[#F0EBE1] opacity-60'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${progressStep >= 2 ? 'bg-[#C9A227] text-white shadow-md' : 'bg-[#F0EBE1] text-[#6B7160]'}`}
              >
                2
              </div>
              <StatusChip status="Checked in" />
            </div>
            <strong
              className={
                progressStep >= 2
                  ? 'text-[#1F3A2E] text-sm font-semibold'
                  : 'text-[#6B7160] text-sm'
              }
            >
              Active Stay
            </strong>
            <span className="text-xs text-[#6B7160] mt-1">Room {room?.number ?? '101'}</span>
          </div>

          {/* Step 3: Completed */}
          <div
            className={`flex flex-col p-4 rounded-xl border transition-all ${progressStep >= 3 ? 'bg-[#FAF7F2] border-[#C9A227]/40 shadow-sm' : 'bg-white border-[#F0EBE1] opacity-60'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${progressStep >= 3 ? 'bg-[#C9A227] text-white shadow-md' : 'bg-[#F0EBE1] text-[#6B7160]'}`}
              >
                3
              </div>
              <StatusChip status="Scheduled" />
            </div>
            <strong
              className={
                progressStep >= 3
                  ? 'text-[#1F3A2E] text-sm font-semibold'
                  : 'text-[#6B7160] text-sm'
              }
            >
              Completed Stay
            </strong>
            <span className="text-xs text-[#6B7160] mt-1">{shortDate(r.checkOut)}</span>
          </div>
        </div>
      </Card>

      {/* Main Grid: Stay Overview, Rewards, Charges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-stretch">
        {/* Current Stay Card */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
              <span className="text-xs font-bold text-[#C9A227] uppercase tracking-wider flex items-center gap-1.5">
                <BedDouble size={16} />
                YOUR RESERVED SANCTUARY
              </span>
              <StatusChip status={r?.status ?? 'Checked in'} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-5 h-48 rounded-xl overflow-hidden border border-[#F0EBE1] shadow-sm">
                <img
                  src="/images/suite.jpg"
                  alt="Resort Suite"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="md:col-span-7 space-y-3">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-[#22261F]">
                    {room?.type ?? 'Ocean Deluxe Suite'}
                  </h2>
                  <p className="text-xs text-[#6B7160] mt-1">
                    Room Number: <strong className="text-[#22261F]">{room?.number ?? '204'}</strong>{' '}
                    · Floor:{' '}
                    <strong className="text-[#22261F]">{room?.floor ?? '2nd Floor'}</strong> · View:{' '}
                    <strong className="text-[#22261F]">Oceanfront Pavilion</strong>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#F0EBE1]">
                    <small className="text-[#6B7160] block font-semibold uppercase text-[10px]">
                      CHECK-IN
                    </small>
                    <strong className="text-sm text-[#1F3A2E] block mt-0.5">
                      {shortDate(r.checkIn)}
                    </strong>
                    <span className="block text-[10px] text-[#6B7160]">After 2:00 PM</span>
                  </div>
                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#F0EBE1]">
                    <small className="text-[#6B7160] block font-semibold uppercase text-[10px]">
                      CHECK-OUT
                    </small>
                    <strong className="text-sm text-[#1F3A2E] block mt-0.5">
                      {shortDate(r.checkOut)}
                    </strong>
                    <span className="block text-[10px] text-[#6B7160]">Before 11:00 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 mt-5 border-t border-[#F0EBE1]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/guest/reservations/${r.id}`)}
            >
              Stay Details & Keycard
            </Button>
            <Button
              size="sm"
              onClick={() => handleQuickRequest('In-Room Dining Request', 'Room Service')}
            >
              <Utensils size={15} /> Order Room Service
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickRequest('Housekeeping Extra Towels', 'Housekeeping')}
            >
              <Sparkles size={15} /> Extra Towels & Amenities
            </Button>
          </div>
        </Card>

        {/* Loyalty & Billing Cards Column */}
        <div className="flex flex-col gap-6">
          {/* Palm Rewards Card */}
          <Card
            className={`p-6 flex-1 flex flex-col justify-between transition-all duration-300 ${pulseGold ? 'gold-pulse-effect border-[#C9A227]' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-[#6B7160] uppercase tracking-wider block">
                  PALM REWARDS BALANCE
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h2 className="text-3xl font-bold font-serif text-[#C9A227]">
                    <Counter value={g.points || 1250} />
                  </h2>
                  <span className="text-xs font-bold text-[#6B7160]">PTS</span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-[#C9A227]/10 text-[#C9A227] px-2.5 py-0.5 rounded-full text-[11px] font-bold mt-2 border border-[#C9A227]/20">
                  <Sparkles size={12} /> Gold Tier VIP Member
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C9A227]/20 to-[#C9A227]/5 text-[#C9A227] flex items-center justify-center font-bold border border-[#C9A227]/20 shadow-sm shrink-0">
                <Gift size={24} />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4 justify-center border-[#C9A227]/30 text-[#C9A227] hover:bg-[#C9A227]/10"
              onClick={() => {
                triggerGoldPulse();
                navigate('/guest/loyalty');
              }}
            >
              Redeem Palm Points <ArrowRight size={14} />
            </Button>
          </Card>

          {/* Charges & Payments Card */}
          <Card className="p-6 flex-1 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-[#6B7160] uppercase tracking-wider block">
                  FOLIO OUTSTANDING BALANCE
                </span>
                <h2 className="text-2xl font-bold font-serif text-[#22261F] mt-1">
                  {money(Math.max(0, balance))}
                </h2>
                <p className="text-[11px] text-[#6B7160] mt-1">Room Rate + Add-on Experiences</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#1F3A2E]/10 text-[#1F3A2E] flex items-center justify-center shrink-0">
                <CreditCard size={20} />
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t border-[#F0EBE1]">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 justify-center"
                onClick={() => navigate('/guest/billing')}
              >
                View Folio Bill
              </Button>
              <Button
                size="sm"
                className="flex-1 justify-center"
                onClick={() => navigate(`/guest/billing?reservation=${r.id}`)}
              >
                Pay Now
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Grid Row 2: Today at the Resort & Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Today at the Resort Card */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0EBE1]">
            <div>
              <h3 className="font-serif font-bold text-xl text-[#22261F] flex items-center gap-2">
                <Sun size={20} className="text-[#C9A227]" />
                Today at the Resort
              </h3>
              <p className="text-xs text-[#6B7160]">
                Curated daily schedule, activities, and dining events
              </p>
            </div>
            <Badge>4 Highlights Today</Badge>
          </div>

          <div className="space-y-3">
            {dailySchedule.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-[#F0EBE1] hover:border-[#C9A227] transition-all bg-[#FAF7F2]/50 hover:bg-[#FAF7F2] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-[#1F3A2E]/10 text-[#1F3A2E] flex items-center justify-center font-bold shrink-0">
                      <Icon size={19} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-[#C9A227]">
                          {item.time}
                        </span>
                        <span className="text-[11px] text-[#6B7160]">· {item.location}</span>
                      </div>
                      <strong className="block text-sm text-[#22261F] mt-0.5">{item.title}</strong>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleQuickRequest(`Activity enquiry: ${item.title}`, 'Activities')
                    }
                  >
                    Enquire <ChevronRight size={14} />
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Service Requests Section */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0EBE1]">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#22261F]">Recent Requests</h3>
                <p className="text-xs text-[#6B7160]">Track active service orders</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Create concierge request"
                onClick={() => navigate('/guest/support?new=1')}
              >
                <Plus size={18} />
              </Button>
            </div>

            <div className="space-y-3">
              {recentRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-xl border border-[#F0EBE1] bg-[#FAF7F2]/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#6B7160] uppercase">
                      {req.category}
                    </span>
                    <StatusChip status={req.status} />
                  </div>
                  <strong className="block text-xs text-[#22261F]">{req.service}</strong>
                  <span className="text-[11px] text-[#6B7160] block">{req.time}</span>
                </div>
              ))}
              {!recentRequests.length && (
                <Empty
                  title="No requests yet"
                  description="Your concierge requests will appear here."
                />
              )}
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full mt-4 justify-center"
            onClick={() => navigate('/guest/support')}
          >
            View All Concierge Tickets <ArrowRight size={14} />
          </Button>
        </Card>
      </div>

      {/* Explore Experiences Section (Marketplace Cards) */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif font-bold text-2xl text-[#22261F]">
              Explore Resort Experiences
            </h2>
            <p className="text-xs text-[#6B7160]">
              Handcrafted activities, wellness therapies, and gourmet dining
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/guest/services')}>
            View Full Experiences Marketplace <ArrowUpRight size={16} />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {experiences.map((exp) => (
            <Card key={exp.id} className="overflow-hidden group hover:shadow-md transition-all">
              <div className="relative h-40 overflow-hidden bg-gray-100">
                <img
                  src={exp.image}
                  alt={exp.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 bg-[#1F3A2E]/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm">
                  {exp.category}
                </span>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-serif font-bold text-base text-[#22261F] group-hover:text-[#C9A227] transition-colors">
                  {exp.title}
                </h3>
                <p className="text-xs text-[#6B7160] line-clamp-1">{exp.subtitle}</p>
                <div className="flex items-center justify-between pt-2 border-t border-[#F0EBE1]">
                  <div>
                    <span className="text-[10px] text-[#6B7160] block uppercase">
                      {exp.duration}
                    </span>
                    <strong className="text-sm text-[#1F3A2E] font-serif">{exp.price}</strong>
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      navigate(`/guest/services?new=1&service=${encodeURIComponent(exp.title)}`)
                    }
                  >
                    Request
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Help & Support / Concierge Quick Panel */}
      <Card className="p-6 bg-gradient-to-r from-[#FAF7F2] via-white to-[#FAF7F2] border border-[#F0EBE1]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#C9A227] uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <HelpCircle size={15} />
              24/7 GUEST CONCIERGE ASSISTANCE
            </span>
            <h3 className="font-serif font-bold text-xl text-[#22261F]">
              How can we elevate your stay today?
            </h3>
            <p className="text-xs text-[#6B7160]">
              Select a one-touch request below or reach our front desk instantly.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickRequest('Housekeeping Cleaning Request', 'Housekeeping')}
            >
              🧹 Clean My Room
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickRequest('In-Room Breakfast Order', 'Room Service')}
            >
              🍽️ Room Service
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickRequest('Resort Buggy Pick-up', 'Concierge')}
            >
              🛺 Resort Buggy
            </Button>
            <Button size="sm" onClick={() => navigate('/guest/support')}>
              <MessageSquare size={15} /> Concierge requests
            </Button>
          </div>
        </div>
      </Card>
    </PageMotion>
  );
}

/* Dedicated Role-Based Staff Dashboards (Strictly role-based via Login, no generic switcher) */
function StaffRoleDashboard() {
  const { s, actor, act } = useStore();
  const navigate = useNavigate();
  const role = actor?.role as string;
  const [guestFormOpen, setGuestFormOpen] = useState(false);
  const [damageReportOpen, setDamageReportOpen] = useState(false);
  const [maintenanceFormOpen, setMaintenanceFormOpen] = useState(false);
  const [gardenerReportOpen, setGardenerReportOpen] = useState(false);
  const [fnbOrderOpen, setFnbOrderOpen] = useState(false);
  const [spaBookingOpen, setSpaBookingOpen] = useState(false);

  // Role: Receptionist
  if (role === 'Receptionist') {
    return (
      <PageMotion>
        <PageTitle
          eyebrow="RECEPTIONIST WORKSPACE · FRONT DESK"
          title={`Front Desk Operations — Welcome, ${actor!.name.split(' ')[0]}`}
          description="Check room availability, register walk-in guests, generate guest portal logins, & process check-in/out."
          actions={
            <Button onClick={() => setGuestFormOpen(true)}>
              <UserPlus size={16} /> Walk-in Registration & Guest Credentials
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          <Card className="p-5 md:col-span-2">
            <CardHead
              title="Today's Arrivals & Check-Ins"
              subtitle="Confirm guest arrival, assign room, and activate stay"
            />
            <div className="table-scroll mt-3">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF7F2] text-[#6B7160]">
                  <tr>
                    <th className="p-2.5">Guest Name</th>
                    <th className="p-2.5">Assigned Room</th>
                    <th className="p-2.5">Check-In / Out</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE1]">
                  {s.reservations
                    .filter((r) => ['Confirmed', 'Checked in'].includes(r.status))
                    .slice(0, 6)
                    .map((r) => {
                      const g = s.guests.find((x) => x.id === r.guestId);
                      const room = findRoom(s, r.roomId);
                      return (
                        <tr key={r.id}>
                          <td className="p-2.5 font-bold text-[#22261F]">{g?.name ?? 'Guest'}</td>
                          <td className="p-2.5">
                            Room {room?.number} ({room?.type})
                          </td>
                          <td className="p-2.5">
                            {shortDate(r.checkIn)} – {shortDate(r.checkOut)}
                          </td>
                          <td className="p-2.5">
                            <Badge>{r.status}</Badge>
                          </td>
                          <td className="p-2.5 text-right">
                            {r.status === 'Confirmed' && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  act(
                                    {
                                      type: 'reservation.status',
                                      payload: { id: r.id, status: 'Checked in' },
                                    },
                                    `Guest ${g?.name} checked in successfully!`,
                                  )
                                }
                              >
                                Check In
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-5">
            <CardHead title="Room Availability Check" subtitle="Search ready rooms by wing" />
            <div className="space-y-2 mt-3 max-h-72 overflow-y-auto">
              {s.rooms.slice(0, 8).map((rm) => (
                <div
                  key={rm.id}
                  className="p-2.5 border border-[#F0EBE1] rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="block text-[#22261F]">Room {rm.number}</strong>
                    <span className="text-[11px] text-[#6B7160]">
                      {rm.type} · ₹{rm.rate}/night
                    </span>
                  </div>
                  <Badge>{rm.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Walk-in Guest Registration & Auto Guest Credentials Popup Modal */}
        {guestFormOpen && (
          <FormModal
            title="Register Walk-in Guest & Issue Credentials"
            description="Create new reservation and auto-generate Guest Portal credentials for the guest."
            initial={{ checkIn: today(), checkOut: dateOffset(2) }}
            fields={[
              {
                name: 'name',
                label: 'Guest Full Name',
                required: true,
                placeholder: 'e.g. Ramesh Verma',
              },
              {
                name: 'email',
                label: 'Guest Email (Login ID)',
                type: 'email',
                required: true,
                placeholder: 'ramesh@example.com',
              },
              {
                name: 'phone',
                label: 'Phone Number',
                required: true,
                placeholder: '+91 98765 00000',
              },
              {
                name: 'roomId',
                label: 'Assign Room',
                type: 'select',
                required: true,
                options: s.rooms
                  .filter((r) => r.status === 'Ready' && r.active !== false)
                  .map((r) => ({
                    value: r.id,
                    label: `Room ${r.number} (${r.type} - ₹${r.rate})`,
                  })),
              },
              { name: 'checkIn', label: 'Check-In Date', type: 'date', required: true },
              { name: 'checkOut', label: 'Check-Out Date', type: 'date', required: true },
            ]}
            onClose={() => setGuestFormOpen(false)}
            onSubmit={(values) => {
              const res = act(
                {
                  type: 'reservation.create',
                  payload: {
                    name: values.name,
                    email: values.email,
                    phone: values.phone,
                    roomId: values.roomId,
                    checkIn: values.checkIn || today(),
                    checkOut: values.checkOut || dateOffset(2),
                    adults: 2,
                  },
                },
                'Walk-in reservation confirmed! Guest credentials generated.',
              );
              return res;
            }}
            submit="Confirm Walk-In & Generate Login"
          />
        )}
      </PageMotion>
    );
  }

  // Role: Housekeeping
  if (role === 'Housekeeping') {
    return (
      <PageMotion>
        <PageTitle
          eyebrow="HOUSEKEEPING WORKSPACE · ROOM CLEANING & TURNOVER"
          title={`Housekeeping Board — Welcome, ${actor!.name.split(' ')[0]}`}
          description="View assigned turnover tasks, update cleaning statuses, and report room damage / lost & found items."
          actions={
            <Button variant="outline" onClick={() => setDamageReportOpen(true)}>
              <AlertCircle size={16} /> Report Damage / Lost & Found
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          <Card className="p-5 md:col-span-2">
            <CardHead
              title="Assigned Turnover Cleaning Tasks"
              subtitle="Update status: Dirty → Cleaning → Inspection"
            />
            <div className="space-y-3 mt-3">
              {s.tasks
                .filter((t) => t.role === 'Housekeeping')
                .map((task) => {
                  const rm = findRoom(s, task.roomId);
                  return (
                    <div
                      key={task.id}
                      className="p-3.5 border border-[#F0EBE1] rounded-xl flex items-center justify-between bg-[#FAF7F2]/50"
                    >
                      <div>
                        <strong className="block text-sm text-[#22261F]">{task.title}</strong>
                        <span className="text-xs text-[#6B7160]">
                          Room {rm?.number} ({rm?.type}) · Priority: {task.priority}
                        </span>
                        <div className="mt-1">
                          <Badge>{task.status}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {task.status === 'Pending' && (
                          <Button
                            size="sm"
                            onClick={() =>
                              act(
                                {
                                  type: 'task.update',
                                  payload: { id: task.id, status: 'In progress' },
                                },
                                'Cleaning started',
                              )
                            }
                          >
                            Start Cleaning
                          </Button>
                        )}
                        {task.status === 'In progress' && (
                          <Button
                            size="sm"
                            onClick={() =>
                              act(
                                {
                                  type: 'task.update',
                                  payload: { id: task.id, status: 'Inspection' },
                                },
                                'Task sent for management inspection',
                              )
                            }
                          >
                            Request Inspection
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>

          <Card className="p-5">
            <CardHead title="Dirty Rooms Board" subtitle="Rooms awaiting turnover" />
            <div className="space-y-2 mt-3">
              {s.rooms
                .filter((r) => r.status === 'Dirty')
                .map((r) => (
                  <div
                    key={r.id}
                    className="p-3 border border-[#F0EBE1] rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="block text-[#22261F]">Room {r.number}</strong>
                      <span className="text-[#6B7160]">{r.type}</span>
                    </div>
                    <Badge>Dirty</Badge>
                  </div>
                ))}
              {!s.rooms.some((r) => r.status === 'Dirty') && (
                <p className="text-xs text-[#6B7160] py-4 text-center">All rooms cleaned!</p>
              )}
            </div>
          </Card>
        </div>

        {damageReportOpen && (
          <FormModal
            title="Report Room Damage or Lost & Found"
            description="Log item found or damage observed during turnover."
            fields={[
              {
                name: 'roomId',
                label: 'Room Number',
                type: 'select',
                required: true,
                options: s.rooms.map((r) => ({ value: r.id, label: `Room ${r.number}` })),
              },
              {
                name: 'title',
                label: 'Item / Damage Description',
                required: true,
                placeholder: 'e.g. Silver reading glasses found on table',
              },
            ]}
            onClose={() => setDamageReportOpen(false)}
            onSubmit={(values) => {
              return act(
                { type: 'found.create', payload: { roomId: values.roomId, title: values.title } },
                'Lost & Found item logged!',
              );
            }}
            submit="Submit Report"
          />
        )}
      </PageMotion>
    );
  }

  // Role: Cashier
  if (role === 'Cashier') {
    return (
      <PageMotion>
        <PageTitle
          eyebrow="CASHIER WORKSPACE · BILLING & PAYMENTS"
          title={`Cashier Desk — Welcome, ${actor!.name.split(' ')[0]}`}
          description="View guest folios, accept payments via Card/UPI/Cash/Bank, issue refunds, and print formal invoices."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          <Card className="p-5 md:col-span-2">
            <CardHead
              title="Guest Folios & Payment Processing"
              subtitle="Select a stay to collect payment or view charges"
            />
            <div className="table-scroll mt-3">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF7F2] text-[#6B7160]">
                  <tr>
                    <th className="p-2.5">Guest</th>
                    <th className="p-2.5">Room</th>
                    <th className="p-2.5">Total Bill</th>
                    <th className="p-2.5">Paid</th>
                    <th className="p-2.5">Balance</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE1]">
                  {s.reservations
                    .filter((r) => ['Checked in', 'Completed'].includes(r.status))
                    .slice(0, 6)
                    .map((r) => {
                      const g = s.guests.find((x) => x.id === r.guestId);
                      const room = findRoom(s, r.roomId);
                      const f = folio(s, r);
                      return (
                        <tr key={r.id}>
                          <td className="p-2.5 font-bold text-[#22261F]">{g?.name}</td>
                          <td className="p-2.5">Room {room?.number}</td>
                          <td className="p-2.5">{money(f.total)}</td>
                          <td className="p-2.5 text-[#2E7D4F]">{money(f.paid)}</td>
                          <td className="p-2.5 font-bold text-[#C1443A]">{money(f.balance)}</td>
                          <td className="p-2.5 text-right">
                            {f.balance > 0 ? (
                              <Button
                                size="sm"
                                onClick={() =>
                                  act(
                                    {
                                      type: 'payment.create',
                                      payload: {
                                        reservationId: r.id,
                                        amount: f.balance,
                                        method: 'Card',
                                      },
                                    },
                                    `Payment of ${money(f.balance)} collected!`,
                                  )
                                }
                              >
                                Accept Payment
                              </Button>
                            ) : (
                              <span className="text-xs text-[#2E7D4F] font-bold">● Settled</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-5">
            <CardHead title="Recent Payment Transactions" subtitle="Live ledger of collections" />
            <div className="space-y-2 mt-3 max-h-72 overflow-y-auto">
              {s.payments.slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 border border-[#F0EBE1] rounded-lg text-xs flex justify-between"
                >
                  <div>
                    <strong className="block text-[#22261F]">
                      {p.type === 'Payment' ? 'Received' : 'Refund'}
                    </strong>
                    <span className="text-[#6B7160]">{p.method}</span>
                  </div>
                  <strong
                    className={`font-mono ${p.type === 'Payment' ? 'text-[#2E7D4F]' : 'text-[#C1443A]'}`}
                  >
                    {p.type === 'Payment' ? '+' : '-'}
                    {money(p.amount)}
                  </strong>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </PageMotion>
    );
  }

  // Role: Maintenance
  if (role === 'Maintenance') {
    return (
      <PageMotion>
        <PageTitle
          eyebrow="MAINTENANCE WORKSPACE · REPAIRS & PROPERTY CARE"
          title={`Maintenance Board — Welcome, ${actor!.name.split(' ')[0]}`}
          description="View assigned repair tasks, update work order statuses, and report room damage or equipment issues."
          actions={
            <Button variant="outline" onClick={() => setMaintenanceFormOpen(true)}>
              <AlertCircle size={16} /> Report Maintenance / Damage
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          <Card className="p-5 md:col-span-2">
            <CardHead
              title="Assigned Maintenance & Repair Tasks"
              subtitle="Update status: Pending → In progress → Inspection"
            />
            <div className="space-y-3 mt-3">
              {s.tasks
                .filter((t) => t.role === 'Maintenance' || t.kind === 'Maintenance')
                .map((task) => {
                  const rm = findRoom(s, task.roomId);
                  return (
                    <div
                      key={task.id}
                      className="p-3.5 border border-[#F0EBE1] rounded-xl flex items-center justify-between bg-[#FAF7F2]/50"
                    >
                      <div>
                        <strong className="block text-sm text-[#22261F]">{task.title}</strong>
                        <span className="text-xs text-[#6B7160]">
                          Room {rm?.number ?? 'General Property'} ({rm?.type ?? 'Resort Area'}) ·
                          Priority: {task.priority}
                        </span>
                        <div className="mt-1">
                          <Badge>{task.status}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {task.status === 'Pending' && (
                          <Button
                            size="sm"
                            onClick={() =>
                              act(
                                {
                                  type: 'task.update',
                                  payload: { id: task.id, status: 'In progress' },
                                },
                                'Maintenance work started',
                              )
                            }
                          >
                            Start Repair
                          </Button>
                        )}
                        {task.status === 'In progress' && (
                          <Button
                            size="sm"
                            onClick={() =>
                              act(
                                {
                                  type: 'task.update',
                                  payload: { id: task.id, status: 'Inspection' },
                                },
                                'Task sent for management inspection',
                              )
                            }
                          >
                            Request Inspection
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              {!s.tasks.some(
                (t) =>
                  (t.role === 'Maintenance' || t.kind === 'Maintenance') &&
                  t.status !== 'Completed',
              ) && (
                <p className="text-xs text-[#6B7160] py-4 text-center">
                  No open maintenance tasks right now.
                </p>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <CardHead title="Rooms Under Maintenance" subtitle="Rooms taken out of service" />
            <div className="space-y-2 mt-3">
              {s.rooms
                .filter((r) => r.status === 'Maintenance')
                .map((r) => (
                  <div
                    key={r.id}
                    className="p-3 border border-[#F0EBE1] rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="block text-[#22261F]">Room {r.number}</strong>
                      <span className="text-[#6B7160]">{r.type}</span>
                    </div>
                    <Badge>Maintenance</Badge>
                  </div>
                ))}
              {!s.rooms.some((r) => r.status === 'Maintenance') && (
                <p className="text-xs text-[#6B7160] py-4 text-center">All rooms operational!</p>
              )}
            </div>
          </Card>
        </div>

        {maintenanceFormOpen && (
          <FormModal
            title="Report Room Damage or Maintenance Issue"
            description="Log an issue to schedule repair or take an unoccupied room out of service."
            fields={[
              {
                name: 'roomId',
                label: 'Room Number',
                type: 'select',
                required: true,
                options: s.rooms.map((r) => ({ value: r.id, label: `Room ${r.number}` })),
              },
              {
                name: 'title',
                label: 'Item / Damage Description',
                required: true,
                placeholder: 'e.g. AC cooling malfunction / bathroom leak',
              },
            ]}
            onClose={() => setMaintenanceFormOpen(false)}
            onSubmit={(values) => {
              return act(
                {
                  type: 'task.create',
                  payload: {
                    title: values.title,
                    roomId: values.roomId,
                    priority: 'Medium',
                    kind: 'Maintenance',
                    deadline: today() + 'T18:00',
                    role: 'Maintenance',
                  },
                },
                'Maintenance issue reported and logged!',
              );
            }}
            submit="Submit Report"
          />
        )}
      </PageMotion>
    );
  }

  // Role: Gardener
  if (role === 'Gardener') {
    const gardenerTasks = s.tasks.filter((t) => t.role === 'Gardener' || t.kind === 'Property');
    const activityServices = s.services.filter(
      (srv) => srv.category === 'Activities' || srv.name.toLowerCase().includes('kayak'),
    );

    return (
      <PageMotion>
        <PageTitle
          eyebrow="GARDENER WORKSPACE · GROUNDS & LANDSCAPE CARE"
          title={`Gardening Board — Welcome, ${actor!.name.split(' ')[0]}`}
          description="View assigned landscape tasks, property upkeep, and coordinate outdoor activity requests."
          actions={
            <Button variant="outline" onClick={() => setGardenerReportOpen(true)}>
              <Leaf size={16} /> Report Grounds Issue
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          <Card className="p-5 md:col-span-2">
            <CardHead
              title="Assigned Landscape & Grounds Tasks"
              subtitle="Update status: Pending → In progress → Inspection"
            />
            <div className="space-y-3 mt-3">
              {gardenerTasks.map((task) => {
                const rm = findRoom(s, task.roomId);
                return (
                  <div
                    key={task.id}
                    className="p-3.5 border border-[#F0EBE1] rounded-xl flex items-center justify-between bg-[#FAF7F2]/50"
                  >
                    <div>
                      <strong className="block text-sm text-[#22261F]">{task.title}</strong>
                      <span className="text-xs text-[#6B7160]">
                        Location: Room {rm?.number ?? 'Resort Grounds'} (
                        {rm?.type ?? 'Outdoor Area'}) · Priority: {task.priority}
                      </span>
                      <div className="mt-1">
                        <Badge>{task.status}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {task.status === 'Pending' && (
                        <Button
                          size="sm"
                          onClick={() =>
                            act(
                              {
                                type: 'task.update',
                                payload: { id: task.id, status: 'In progress' },
                              },
                              'Gardening work started',
                            )
                          }
                        >
                          Start Work
                        </Button>
                      )}
                      {task.status === 'In progress' && (
                        <Button
                          size="sm"
                          onClick={() =>
                            act(
                              {
                                type: 'task.update',
                                payload: { id: task.id, status: 'Inspection' },
                              },
                              'Task sent for management inspection',
                            )
                          }
                        >
                          Request Inspection
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              {gardenerTasks.length === 0 && (
                <p className="text-xs text-[#6B7160] py-4 text-center">
                  No open grounds tasks right now.
                </p>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <CardHead title="Outdoor Activity Requests" subtitle="Guest recreation bookings" />
            <div className="space-y-3 mt-3">
              {activityServices.map((srv) => {
                const r = s.reservations.find((x) => x.id === srv.reservationId);
                const g = s.guests.find((x) => x.id === r?.guestId);
                return (
                  <div
                    key={srv.id}
                    className="p-3 border border-[#F0EBE1] rounded-lg text-xs space-y-2 bg-[#FAF7F2]/30"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-[#22261F]">{srv.name}</strong>
                      <Badge>{srv.status}</Badge>
                    </div>
                    <div className="text-[#6B7160] text-[11px] flex justify-between">
                      <span>
                        {g?.name ?? 'Guest'} · {srv.time}
                      </span>
                      <span className="font-semibold text-[#1F3A2E]">{money(srv.amount)}</span>
                    </div>
                    {srv.status === 'Requested' && (
                      <Button
                        size="sm"
                        className="w-full text-xs"
                        onClick={() =>
                          act(
                            {
                              type: 'service.update',
                              payload: { id: srv.id, status: 'In progress' },
                            },
                            'Activity started',
                          )
                        }
                      >
                        Start Activity
                      </Button>
                    )}
                    {srv.status === 'In progress' && (
                      <Button
                        size="sm"
                        className="w-full text-xs"
                        onClick={() =>
                          act(
                            {
                              type: 'service.update',
                              payload: { id: srv.id, status: 'Completed' },
                            },
                            'Activity completed & charged',
                          )
                        }
                      >
                        Complete Activity
                      </Button>
                    )}
                  </div>
                );
              })}
              {activityServices.length === 0 && (
                <p className="text-xs text-[#6B7160] py-4 text-center">
                  No open activity requests.
                </p>
              )}
            </div>
          </Card>
        </div>

        {gardenerReportOpen && (
          <FormModal
            title="Report Grounds / Landscape Issue"
            description="Log grounds maintenance, plant care, or outdoor property task."
            fields={[
              {
                name: 'roomId',
                label: 'Resort Area / Zone',
                type: 'select',
                required: true,
                options: s.rooms.map((r) => ({
                  value: r.id,
                  label: `Near Room ${r.number} · ${r.type}`,
                })),
              },
              {
                name: 'title',
                label: 'Task / Issue Description',
                required: true,
                placeholder: 'e.g. Trim palm fronds near pool / fix sprinkler',
              },
            ]}
            onClose={() => setGardenerReportOpen(false)}
            onSubmit={(values) => {
              return act(
                {
                  type: 'task.create',
                  payload: {
                    title: values.title,
                    roomId: values.roomId,
                    priority: 'Medium',
                    kind: 'Property',
                    deadline: today() + 'T18:00',
                    role: 'Gardener',
                  },
                },
                'Grounds issue reported and logged!',
              );
            }}
            submit="Submit Report"
          />
        )}
      </PageMotion>
    );
  }

  // Role: F&B
  if (role === 'F&B') {
    const diningServices = s.services.filter(
      (srv) =>
        srv.category === 'Food & Beverage' ||
        srv.name.toLowerCase().includes('dining') ||
        srv.name.toLowerCase().includes('food'),
    );
    const fnbTasks = s.tasks.filter((t) => t.role === 'F&B');

    return (
      <PageMotion>
        <PageTitle
          eyebrow="F&B WORKSPACE · IN-ROOM DINING & KITCHEN"
          title={`Food & Beverage Desk — Welcome, ${actor!.name.split(' ')[0]}`}
          description="Manage guest in-room dining orders, kitchen preparation queue, and deliver culinary requests."
          actions={
            <Button variant="outline" onClick={() => setFnbOrderOpen(true)}>
              <Utensils size={16} /> Log Dining Order
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          <Card className="p-5 md:col-span-2">
            <CardHead
              title="Active In-Room Dining & Meal Orders"
              subtitle="Update status: Requested → In progress → Completed"
            />
            <div className="space-y-3 mt-3">
              {diningServices.map((srv) => {
                const r = s.reservations.find((x) => x.id === srv.reservationId);
                const g = s.guests.find((x) => x.id === r?.guestId);
                const rm = findRoom(s, r?.roomId);
                return (
                  <div
                    key={srv.id}
                    className="p-3.5 border border-[#F0EBE1] rounded-xl flex items-center justify-between bg-[#FAF7F2]/50"
                  >
                    <div>
                      <strong className="block text-sm text-[#22261F]">{srv.name}</strong>
                      <span className="text-xs text-[#6B7160]">
                        Room {rm?.number ?? 'Direct'} · {g?.name ?? 'Guest'} ·{' '}
                        {srv.options || 'Standard order'} · {srv.time}
                      </span>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge>{srv.status}</Badge>
                        <span className="text-xs font-semibold text-[#1F3A2E]">
                          {money(srv.amount)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {srv.status === 'Requested' && (
                        <Button
                          size="sm"
                          onClick={() =>
                            act(
                              {
                                type: 'service.update',
                                payload: { id: srv.id, status: 'In progress' },
                              },
                              'Order preparation started',
                            )
                          }
                        >
                          Start Prep
                        </Button>
                      )}
                      {srv.status === 'In progress' && (
                        <Button
                          size="sm"
                          onClick={() =>
                            act(
                              {
                                type: 'service.update',
                                payload: { id: srv.id, status: 'Completed' },
                              },
                              'Order delivered & added to folio',
                            )
                          }
                        >
                          Deliver & Charge
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              {diningServices.length === 0 && (
                <p className="text-xs text-[#6B7160] py-4 text-center">
                  No active dining orders right now.
                </p>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <CardHead title="Kitchen & Service Tasks" subtitle="Assigned culinary duties" />
            <div className="space-y-3 mt-3">
              {fnbTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 border border-[#F0EBE1] rounded-xl flex items-center justify-between bg-[#FAF7F2]/50"
                >
                  <div>
                    <strong className="block text-sm text-[#22261F]">{t.title}</strong>
                    <span className="text-xs text-[#6B7160]">Priority: {t.priority}</span>
                    <div className="mt-1">
                      <Badge>{t.status}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {t.status === 'Pending' && (
                      <Button
                        size="sm"
                        onClick={() =>
                          act(
                            { type: 'task.update', payload: { id: t.id, status: 'In progress' } },
                            'Task started',
                          )
                        }
                      >
                        Start Work
                      </Button>
                    )}
                    {t.status === 'In progress' && (
                      <Button
                        size="sm"
                        onClick={() =>
                          act(
                            { type: 'task.update', payload: { id: t.id, status: 'Inspection' } },
                            'Task sent for management inspection',
                          )
                        }
                      >
                        Request Inspection
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {fnbTasks.length === 0 && (
                <p className="text-xs text-[#6B7160] py-4 text-center">
                  All kitchen duties up to date!
                </p>
              )}
            </div>
          </Card>
        </div>

        {fnbOrderOpen && (
          <FormModal
            title="Log In-Room Dining Order"
            description="Create an in-room dining request for an active guest stay."
            initial={{ time: '13:00' }}
            fields={[
              {
                name: 'reservationId',
                label: 'Active Guest Stay',
                type: 'select',
                required: true,
                options: s.reservations
                  .filter((r) => r.status === 'Checked in')
                  .map((r) => {
                    const g = s.guests.find((x) => x.id === r.guestId);
                    const rm = s.rooms.find((x) => x.id === r.roomId);
                    return { value: r.id, label: `Room ${rm?.number} — ${g?.name}` };
                  }),
              },
              {
                name: 'options',
                label: 'Dietary / Item Notes',
                placeholder: 'e.g. 2x Club Sandwich, extra ketchup',
              },
              { name: 'time', label: 'Delivery Time', type: 'time', required: true },
            ]}
            onClose={() => setFnbOrderOpen(false)}
            onSubmit={(values) => {
              return act(
                {
                  type: 'service.create',
                  payload: {
                    reservationId: values.reservationId,
                    name: 'In-room dining',
                    date: today(),
                    time: values.time || '13:00',
                    options: values.options || 'In-room dining order',
                  },
                },
                'Dining order created successfully!',
              );
            }}
            submit="Place Order"
          />
        )}
      </PageMotion>
    );
  }

  // Role: Spa
  if (role === 'Spa') {
    const spaServices = s.services.filter(
      (srv) =>
        srv.category === 'Spa' ||
        srv.name.toLowerCase().includes('massage') ||
        srv.name.toLowerCase().includes('spa'),
    );
    const spaTasks = s.tasks.filter((t) => t.role === 'Spa');

    return (
      <PageMotion>
        <PageTitle
          eyebrow="SPA WORKSPACE · WELLNESS & THERAPIES"
          title={`Spa & Wellness Board — Welcome, ${actor!.name.split(' ')[0]}`}
          description="Manage wellness appointments, Balinese therapies, and spa treatment room schedules."
          actions={
            <Button variant="outline" onClick={() => setSpaBookingOpen(true)}>
              <Sparkles size={16} /> Book Spa Session
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          <Card className="p-5 md:col-span-2">
            <CardHead
              title="Spa Appointments & Treatment Sessions"
              subtitle="Update status: Requested → In progress → Completed"
            />
            <div className="space-y-3 mt-3">
              {spaServices.map((srv) => {
                const r = s.reservations.find((x) => x.id === srv.reservationId);
                const g = s.guests.find((x) => x.id === r?.guestId);
                const rm = s.rooms.find((x) => x.id === r?.roomId);
                return (
                  <div
                    key={srv.id}
                    className="p-3.5 border border-[#F0EBE1] rounded-xl flex items-center justify-between bg-[#FAF7F2]/50"
                  >
                    <div>
                      <strong className="block text-sm text-[#22261F]">{srv.name}</strong>
                      <span className="text-xs text-[#6B7160]">
                        Guest: {g?.name ?? 'Guest'} (Room {rm?.number ?? 'Villa'}) ·{' '}
                        {srv.options || '60 min session'} · {srv.time}
                      </span>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge>{srv.status}</Badge>
                        <span className="text-xs font-semibold text-[#1F3A2E]">
                          {money(srv.amount)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {srv.status === 'Requested' && (
                        <Button
                          size="sm"
                          onClick={() =>
                            act(
                              {
                                type: 'service.update',
                                payload: { id: srv.id, status: 'In progress' },
                              },
                              'Spa session started',
                            )
                          }
                        >
                          Start Session
                        </Button>
                      )}
                      {srv.status === 'In progress' && (
                        <Button
                          size="sm"
                          onClick={() =>
                            act(
                              {
                                type: 'service.update',
                                payload: { id: srv.id, status: 'Completed' },
                              },
                              'Session completed & billed to folio',
                            )
                          }
                        >
                          Complete & Charge
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              {spaServices.length === 0 && (
                <p className="text-xs text-[#6B7160] py-4 text-center">
                  No spa appointments scheduled right now.
                </p>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <CardHead
              title="Spa Suites & Wellness Tasks"
              subtitle="Treatment room preparation & restocking"
            />
            <div className="space-y-3 mt-3">
              {spaTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 border border-[#F0EBE1] rounded-xl flex items-center justify-between bg-[#FAF7F2]/50"
                >
                  <div>
                    <strong className="block text-sm text-[#22261F]">{t.title}</strong>
                    <span className="text-xs text-[#6B7160]">Priority: {t.priority}</span>
                    <div className="mt-1">
                      <Badge>{t.status}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {t.status === 'Pending' && (
                      <Button
                        size="sm"
                        onClick={() =>
                          act(
                            { type: 'task.update', payload: { id: t.id, status: 'In progress' } },
                            'Task started',
                          )
                        }
                      >
                        Start Work
                      </Button>
                    )}
                    {t.status === 'In progress' && (
                      <Button
                        size="sm"
                        onClick={() =>
                          act(
                            { type: 'task.update', payload: { id: t.id, status: 'Inspection' } },
                            'Task sent for management inspection',
                          )
                        }
                      >
                        Request Inspection
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {spaTasks.length === 0 && (
                <p className="text-xs text-[#6B7160] py-4 text-center">
                  All spa suites prepared & stocked!
                </p>
              )}
            </div>
          </Card>
        </div>

        {spaBookingOpen && (
          <FormModal
            title="Book Guest Spa Session"
            description="Schedule a wellness massage or therapy for an in-house guest."
            initial={{ time: '15:00' }}
            fields={[
              {
                name: 'reservationId',
                label: 'Active Guest Stay',
                type: 'select',
                required: true,
                options: s.reservations
                  .filter((r) => r.status === 'Checked in')
                  .map((r) => {
                    const g = s.guests.find((x) => x.id === r.guestId);
                    const rm = s.rooms.find((x) => x.id === r.roomId);
                    return { value: r.id, label: `Room ${rm?.number} — ${g?.name}` };
                  }),
              },
              {
                name: 'options',
                label: 'Treatment Preference / Notes',
                placeholder: 'e.g. Aromatherapy oils, deep tissue focus',
              },
              { name: 'time', label: 'Appointment Time', type: 'time', required: true },
            ]}
            onClose={() => setSpaBookingOpen(false)}
            onSubmit={(values) => {
              return act(
                {
                  type: 'service.create',
                  payload: {
                    reservationId: values.reservationId,
                    name: 'Balinese massage',
                    date: today(),
                    time: values.time || '15:00',
                    options: values.options || 'Balinese massage session',
                  },
                },
                'Spa appointment booked successfully!',
              );
            }}
            submit="Confirm Booking"
          />
        )}
      </PageMotion>
    );
  }

  // Fallback
  return (
    <PageMotion>
      <PageTitle
        eyebrow={`${role.toUpperCase()} WORKSPACE · DEPARTMENT OPERATIONS`}
        title={`${role} Portal — Welcome, ${actor!.name.split(' ')[0]}`}
        description={`Manage ${role} work requests, update service status, and complete resort duties.`}
      />
    </PageMotion>
  );
}
