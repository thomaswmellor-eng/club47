export function generateICS({
  id,
  title,
  date,
  location,
  description,
  event_date,
}: {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  event_date: string; // "2026-04-17"
}): string {
  const dtstart = event_date.replace(/-/g, '');
  const dtendDate = new Date(event_date);
  dtendDate.setDate(dtendDate.getDate() + 1);
  const dtend = dtendDate.toISOString().split('T')[0].replace(/-/g, '');
  const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';

  const escape = (s: string) => s.replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Club 47//Club47//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${id}@club47.fr`,
    `DTSTART;VALUE=DATE:${dtstart}`,
    `DTEND;VALUE=DATE:${dtend}`,
    `SUMMARY:${escape(title)}`,
    `LOCATION:${escape(location)}`,
    `DESCRIPTION:${escape(date + ' — ' + description)}`,
    `CREATED:${now}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
