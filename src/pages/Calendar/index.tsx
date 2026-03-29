import React, { useState } from 'react';
import { useCalendarStore } from '../../stores/useCalendarStore';
import type { CalendarEvent, CalendarEventType, SemesterConfig } from '../../types';
import { generateId } from '../../lib/gameFormulas';

const DAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];
const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  course: '课程',
  schedule: '日程',
  note: '备注',
};
const EVENT_TYPE_COLORS: Record<CalendarEventType, string> = {
  course: '#64B5F6',
  schedule: '#81C784',
  note: '#CE93D8',
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getSemesterWeek(semesterConfig: SemesterConfig | null, today: string): number | null {
  if (!semesterConfig) return null;
  const start = new Date(semesterConfig.startDate);
  const current = new Date(today);
  const diffMs = current.getTime() - start.getTime();
  if (diffMs < 0) return null;
  const week = Math.floor(diffMs / (7 * 24 * 3600 * 1000)) + 1;
  if (week > semesterConfig.totalWeeks) return null;
  return week;
}

const EMPTY_EVENT: Omit<CalendarEvent, 'id'> = {
  userId: 'local',
  title: '',
  eventType: 'schedule',
  isRecurring: false,
  date: '',
};

export const CalendarPage: React.FC = () => {
  const today = new Date().toISOString().slice(0, 10);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventForm, setEventForm] = useState<Omit<CalendarEvent, 'id'>>(EMPTY_EVENT);
  const [semesterForm, setSemesterForm] = useState<SemesterConfig>({
    userId: 'local',
    semesterName: '',
    startDate: today,
    totalWeeks: 20,
  });

  const { events, semesterConfig, addEvent, updateEvent, deleteEvent, setSemesterConfig, getEventsForDate } = useCalendarStore();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const semesterWeek = getSemesterWeek(semesterConfig, today);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentYear(y => y - 1); setCurrentMonth(11); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentYear(y => y + 1); setCurrentMonth(0); }
    else setCurrentMonth(m => m + 1);
  };

  const openAddEvent = (date: string) => {
    setEditingEvent(null);
    setEventForm({ ...EMPTY_EVENT, date });
    setShowEventModal(true);
  };

  const openEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventForm({ ...event });
    setShowEventModal(true);
  };

  const handleSaveEvent = () => {
    if (!eventForm.title.trim()) return;
    if (editingEvent) {
      updateEvent(editingEvent.id, eventForm);
    } else {
      addEvent(eventForm);
    }
    setShowEventModal(false);
  };

  const handleSaveSemester = () => {
    setSemesterConfig(semesterForm);
    setShowSemesterModal(false);
  };

  const selectedDayEvents = getEventsForDate(selectedDate);

  const hasEventOnDay = (dateStr: string) => {
    return getEventsForDate(dateStr).length > 0;
  };

  return (
    <div className="flex h-full gap-4 p-4" style={{ background: 'linear-gradient(135deg, #0a0a1a, #1a0a2e)', minHeight: '100vh' }}>
      {/* Left: Calendar */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Semester banner */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {semesterConfig ? (
              <>
                <span className="text-xs px-3 py-1 rounded-full"
                  style={{ background: 'rgba(100,181,246,0.15)', color: '#64B5F6', border: '1px solid rgba(100,181,246,0.3)' }}>
                  {semesterConfig.semesterName}
                </span>
                {semesterWeek && (
                  <span className="text-xs px-3 py-1 rounded-full"
                    style={{ background: 'rgba(255,213,79,0.1)', color: '#FFD54F', border: '1px solid rgba(255,213,79,0.3)' }}>
                    第 {semesterWeek} 周 / 共 {semesterConfig.totalWeeks} 周
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-white/30">未配置学期</span>
            )}
          </div>
          <button onClick={() => { setSemesterForm(semesterConfig ?? { userId: 'local', semesterName: '', startDate: today, totalWeeks: 20 }); setShowSemesterModal(true); }}
            className="text-xs px-3 py-1 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {semesterConfig ? '编辑学期' : '配置学期'}
          </button>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="text-white/50 hover:text-white px-2 py-1 rounded-lg text-sm">‹</button>
          <h2 className="text-base font-bold text-white">{currentYear} 年 {currentMonth + 1} 月</h2>
          <button onClick={nextMonth} className="text-white/50 hover:text-white px-2 py-1 rounded-lg text-sm">›</button>
        </div>

        {/* Calendar grid */}
        <div className="rounded-xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {DAY_NAMES.map((d) => (
              <div key={d} className="text-center text-xs py-2 text-white/40">{d}</div>
            ))}
          </div>
          {/* Days */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="p-1 h-12" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = toDateStr(currentYear, currentMonth, day);
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDate;
              const hasEvent = hasEventOnDay(dateStr);
              return (
                <button key={day} onClick={() => setSelectedDate(dateStr)}
                  className="p-1 h-12 flex flex-col items-center justify-center relative transition-all"
                  style={{
                    background: isSelected ? 'rgba(255,213,79,0.15)' : 'transparent',
                    borderRadius: '8px',
                  }}>
                  <span className="text-sm"
                    style={{
                      color: isToday ? '#FFD54F' : isSelected ? '#fff' : 'rgba(255,255,255,0.7)',
                      fontWeight: isToday ? 'bold' : 'normal',
                      width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '50%',
                      background: isToday ? 'rgba(255,213,79,0.2)' : 'transparent',
                    }}>
                    {day}
                  </span>
                  {hasEvent && (
                    <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: '#64B5F6' }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Day detail */}
      <div className="w-72 shrink-0 flex flex-col gap-3">
        <div className="rounded-xl p-4"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">{selectedDate}</h3>
            <button onClick={() => openAddEvent(selectedDate)}
              className="text-xs px-3 py-1 rounded-lg"
              style={{ background: 'rgba(100,181,246,0.15)', color: '#64B5F6', border: '1px solid rgba(100,181,246,0.3)' }}>
              + 添加
            </button>
          </div>
          {selectedDayEvents.length === 0 ? (
            <p className="text-xs text-white/30 text-center py-4">暂无安排</p>
          ) : (
            <div className="flex flex-col gap-2">
              {selectedDayEvents.map((event) => (
                <div key={event.id} className="rounded-lg p-3 flex items-start justify-between gap-2"
                  style={{ background: 'rgba(255,255,255,0.04)', borderLeft: `3px solid ${EVENT_TYPE_COLORS[event.eventType]}` }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs px-1.5 py-0.5 rounded"
                        style={{ background: `${EVENT_TYPE_COLORS[event.eventType]}22`, color: EVENT_TYPE_COLORS[event.eventType] }}>
                        {EVENT_TYPE_LABELS[event.eventType]}
                      </span>
                      {event.isRecurring && (
                        <span className="text-xs text-white/30">每周{DAY_NAMES[event.dayOfWeek ?? 0]}</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-white truncate">{event.title}</p>
                    {event.timeStart && (
                      <p className="text-xs text-white/40 mt-0.5">{event.timeStart}{event.timeEnd ? ` - ${event.timeEnd}` : ''}</p>
                    )}
                    {event.location && (
                      <p className="text-xs text-white/40">📍 {event.location}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEditEvent(event)} className="text-white/30 hover:text-white text-xs">✏</button>
                    <button onClick={() => deleteEvent(event.id)} className="text-white/30 hover:text-red-400 text-xs">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-xl p-5 w-96 flex flex-col gap-3"
            style={{ background: '#1a1030', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-base font-bold text-white mb-1">{editingEvent ? '编辑事件' : '添加事件'}</h3>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/50">标题</label>
              <input value={eventForm.title} onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                placeholder="事件标题" />
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-white/50">类型</label>
                <select value={eventForm.eventType}
                  onChange={(e) => setEventForm((f) => ({ ...f, eventType: e.target.value as CalendarEventType }))}
                  className="rounded-lg px-3 py-2 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <option value="course">课程</option>
                  <option value="schedule">日程</option>
                  <option value="note">备注</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-white/50">重复</label>
                <select value={eventForm.isRecurring ? 'yes' : 'no'}
                  onChange={(e) => setEventForm((f) => ({ ...f, isRecurring: e.target.value === 'yes' }))}
                  className="rounded-lg px-3 py-2 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <option value="no">单次</option>
                  <option value="yes">每周</option>
                </select>
              </div>
            </div>

            {eventForm.isRecurring ? (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/50">星期</label>
                <select value={eventForm.dayOfWeek ?? 0}
                  onChange={(e) => setEventForm((f) => ({ ...f, dayOfWeek: Number(e.target.value) }))}
                  className="rounded-lg px-3 py-2 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {DAY_NAMES.map((d, i) => <option key={i} value={i}>星期{d}</option>)}
                </select>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/50">日期</label>
                <input type="date" value={eventForm.date ?? ''}
                  onChange={(e) => setEventForm((f) => ({ ...f, date: e.target.value }))}
                  className="rounded-lg px-3 py-2 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }} />
              </div>
            )}

            <div className="flex gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-white/50">开始时间</label>
                <input type="time" value={eventForm.timeStart ?? ''}
                  onChange={(e) => setEventForm((f) => ({ ...f, timeStart: e.target.value }))}
                  className="rounded-lg px-3 py-2 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }} />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-white/50">结束时间</label>
                <input type="time" value={eventForm.timeEnd ?? ''}
                  onChange={(e) => setEventForm((f) => ({ ...f, timeEnd: e.target.value }))}
                  className="rounded-lg px-3 py-2 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }} />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/50">地点</label>
              <input value={eventForm.location ?? ''}
                onChange={(e) => setEventForm((f) => ({ ...f, location: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                placeholder="地点（可选）" />
            </div>

            <div className="flex gap-2 mt-1">
              <button onClick={() => setShowEventModal(false)}
                className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                取消
              </button>
              <button onClick={handleSaveEvent}
                className="flex-1 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, #FFD54F, #FFB300)', color: '#1a0a00' }}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Semester Config Modal */}
      {showSemesterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-xl p-5 w-80 flex flex-col gap-3"
            style={{ background: '#1a1030', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-base font-bold text-white mb-1">学期配置</h3>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/50">学期名称</label>
              <input value={semesterForm.semesterName}
                onChange={(e) => setSemesterForm((f) => ({ ...f, semesterName: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                placeholder="如：2026春季学期" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/50">开学日期</label>
              <input type="date" value={semesterForm.startDate}
                onChange={(e) => setSemesterForm((f) => ({ ...f, startDate: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/50">总周数</label>
              <input type="number" min={1} max={52} value={semesterForm.totalWeeks}
                onChange={(e) => setSemesterForm((f) => ({ ...f, totalWeeks: Number(e.target.value) }))}
                className="rounded-lg px-3 py-2 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            <div className="flex gap-2 mt-1">
              <button onClick={() => setShowSemesterModal(false)}
                className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                取消
              </button>
              <button onClick={handleSaveSemester}
                className="flex-1 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, #64B5F6, #1976D2)', color: '#fff' }}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
