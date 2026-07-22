const KST_TIME_ZONE = "Asia/Seoul";

function getDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    timeZone: KST_TIME_ZONE,
    year: "numeric"
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

export function getKstDateParam(date = new Date()) {
  const parts = getDateParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getKstDateTimeDisplay(date = new Date()) {
  const parts = getDateParts(date);
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}
