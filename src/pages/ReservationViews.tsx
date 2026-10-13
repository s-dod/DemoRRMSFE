import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Avatar, Badge, Button, Card, DataTable, PageMotion, PageTitle } from '../components/ui';
import { findRoom, nights, shortDate, today } from '../lib/domain';
import type { Reservation } from '../lib/domain';
import { useStore } from '../lib/store';

function ReservationList({
  reservations,
  title,
  description,
}: {
  reservations: Reservation[];
  title: string;
  description: string;
}) {
  const { s, actor } = useStore();
  const navigate = useNavigate();
  const base = `/${actor!.module.toLowerCase()}`;

  return (
    <PageMotion>
      <PageTitle
        eyebrow={actor!.module === 'Owner' ? 'EXECUTIVE OVERVIEW' : 'FRONT DESK'}
        title={title}
        description={description}
      />
      <Card>
        <DataTable
          rows={reservations}
          searchBy={(reservation) =>
            `${reservation.id} ${s.guests.find((guest) => guest.id === reservation.guestId)?.name} ${findRoom(s, reservation.roomId)?.number}`
          }
          placeholder="Search guest, booking or room…"
          columns={[
            {
              key: 'guest',
              label: 'Guest',
              sort: (reservation) =>
                s.guests.find((guest) => guest.id === reservation.guestId)!.name,
              render: (reservation) => {
                const guest = s.guests.find((item) => item.id === reservation.guestId)!;
                return (
                  <div className="person-cell">
                    <Avatar name={guest.name} />
                    <strong>{guest.name}</strong>
                  </div>
                );
              },
            },
            {
              key: 'room',
              label: 'Room',
              sort: (reservation) => findRoom(s, reservation.roomId)!.number,
              render: (reservation) => {
                const room = findRoom(s, reservation.roomId)!;
                return (
                  <>
                    <strong>{room.number}</strong>
                    <small>{room.type}</small>
                  </>
                );
              },
            },
            {
              key: 'dates',
              label: 'Stay dates',
              sort: (reservation) => reservation.checkIn,
              render: (reservation) =>
                `${shortDate(reservation.checkIn)} – ${shortDate(reservation.checkOut)}`,
            },
            {
              key: 'nights',
              label: 'Nights',
              sort: (reservation) => nights(reservation.checkIn, reservation.checkOut),
              render: (reservation) => nights(reservation.checkIn, reservation.checkOut),
            },
            {
              key: 'guests',
              label: 'Guests',
              sort: (reservation) => reservation.adults,
              render: (reservation) => reservation.adults,
            },
            {
              key: 'booking',
              label: 'Booking ID',
              sort: (reservation) => reservation.id,
              render: (reservation) => reservation.id,
            },
            {
              key: 'status',
              label: 'Status',
              sort: (reservation) => reservation.status,
              render: (reservation) => <Badge>{reservation.status}</Badge>,
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (reservation) => (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`View reservation ${reservation.id}`}
                  onClick={() => navigate(`${base}/reservations/${reservation.id}`)}
                >
                  <ArrowUpRight size={17} />
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </PageMotion>
  );
}

export function RecentReservations() {
  const { s } = useStore();
  return (
    <ReservationList
      reservations={s.reservations}
      title="Recent reservations"
      description="All guest reservations across the resort."
    />
  );
}

export function TodayArrivals() {
  const { s } = useStore();
  const arrivals = s.reservations.filter(
    (reservation) => reservation.checkIn === today() && reservation.status === 'Confirmed',
  );
  return (
    <ReservationList
      reservations={arrivals}
      title="Today’s arrivals"
      description="Guests scheduled to check in today."
    />
  );
}
