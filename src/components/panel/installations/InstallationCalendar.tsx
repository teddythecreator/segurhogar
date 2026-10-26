import { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useInstallationsByDateRange } from '@/hooks/useInstallations';
import { INSTALLATION_STATUS_LABELS } from '@/types/database';
import type { InstallationStatus } from '@/types/database';

export function InstallationCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Calcular rango de fechas para el calendario
  const dateRange = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - 7);
    const end = new Date(currentDate);
    end.setDate(end.getDate() + 60);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  }, [currentDate]);

  const { data: installations, isLoading } = useInstallationsByDateRange(
    dateRange.start,
    dateRange.end
  );

  // Convertir instalaciones a eventos de FullCalendar
  const events = useMemo(() => {
    if (!installations) return [];

    return installations.map((inst) => {
      const statusColors: Record<InstallationStatus, string> = {
        solicitada: '#f59e0b', // amarillo
        confirmada: '#3b82f6', // azul
        asignada: '#8b5cf6', // púrpura
        realizada: '#10b981', // verde
        cerrada: '#6b7280', // gris
        cancelada: '#ef4444', // rojo
      };

      const startTime = inst.hora_inicio || '09:00';
      const endTime = inst.hora_fin || '11:00';

      return {
        id: inst.id,
        title: `${inst.customer?.nombre || 'Cliente'} - ${INSTALLATION_STATUS_LABELS[inst.estado]}`,
        start: `${inst.fecha}T${startTime}:00`,
        end: `${inst.fecha}T${endTime}:00`,
        backgroundColor: statusColors[inst.estado],
        borderColor: statusColors[inst.estado],
        extendedProps: {
          installation: inst,
        },
      };
    });
  }, [installations]);

  const handleEventClick = (clickInfo: any) => {
    const installation = clickInfo.event.extendedProps.installation;
    window.location.href = `/panel/instalaciones/${installation.id}`;
  };

  const handleDatesSet = (dateInfo: any) => {
    setCurrentDate(dateInfo.view.currentStart);
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-[#0B1F3A]">Calendario de Instalaciones</h2>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D7FF9]"></div>
          </div>
        ) : (
          <div className="calendar-container">
            <style>{`
              .calendar-container .fc {
                font-family: inherit;
              }
              .calendar-container .fc-toolbar-title {
                font-size: 1.25rem;
                font-weight: 600;
                color: #0B1F3A;
              }
              .calendar-container .fc-button {
                background-color: #2D7FF9;
                border: none;
                font-weight: 500;
              }
              .calendar-container .fc-button:hover {
                background-color: #1e6fd9;
              }
              .calendar-container .fc-button-active {
                background-color: #0B1F3A !important;
              }
              .calendar-container .fc-event {
                cursor: pointer;
                border-radius: 4px;
                padding: 2px 4px;
                font-size: 0.75rem;
              }
              .calendar-container .fc-daygrid-day-number {
                color: #0B1F3A;
                font-weight: 500;
              }
              .calendar-container .fc-col-header-cell {
                background-color: #f9fafb;
                padding: 8px 0;
              }
              .calendar-container .fc-col-header-cell-cushion {
                color: #6b7280;
                font-weight: 600;
                text-decoration: none;
              }
            `}</style>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin] as any}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek',
              }}
              locale={esLocale as any}
              events={events}
              eventClick={handleEventClick}
              datesSet={handleDatesSet}
              height="auto"
              editable={false}
              selectable={false}
            />
          </div>
        )}

        {/* Leyenda */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
            <span>Solicitada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
            <span>Confirmada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8b5cf6' }}></div>
            <span>Asignada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
            <span>Realizada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6b7280' }}></div>
            <span>Cerrada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
            <span>Cancelada</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
