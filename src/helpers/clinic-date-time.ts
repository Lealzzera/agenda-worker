import { BadRequestError } from "@/errors/bad-request.error";

export const DEFAULT_CLINIC_TIME_ZONE = "America/Sao_Paulo";

type DateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function getParts(date: Date, timeZone: string): DateTimeParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  return parts as DateTimeParts;
}

function assertValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format();
  } catch {
    throw new BadRequestError(`Invalid clinic timezone: ${timeZone}`);
  }
}

export function clinicDateTimeToUtc(
  dateString: string,
  timeString: string,
  timeZone = DEFAULT_CLINIC_TIME_ZONE,
): Date {
  assertValidTimeZone(timeZone);
  const [year, month, day] = dateString.split("-").map(Number);
  const [hour, minute, second = 0] = timeString.split(":").map(Number);
  const utcWallClock = Date.UTC(year, month - 1, day, hour, minute, second);
  let result = new Date(utcWallClock);

  // Recalculate once because the initial guess can be on the other side of a
  // daylight-saving transition in timezones that still observe DST.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const parts = getParts(result, timeZone);
    const representedAsUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    result = new Date(result.getTime() + utcWallClock - representedAsUtc);
  }

  const resultingParts = getParts(result, timeZone);
  if (
    resultingParts.year !== year ||
    resultingParts.month !== month ||
    resultingParts.day !== day ||
    resultingParts.hour !== hour ||
    resultingParts.minute !== minute ||
    resultingParts.second !== second
  ) {
    throw new BadRequestError("Invalid date or time for the clinic timezone");
  }

  return result;
}

export function formatDateInTimeZone(date: Date, timeZone: string): string {
  const { year, month, day } = getParts(date, timeZone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function formatTimeInTimeZone(date: Date, timeZone: string): string {
  const { hour, minute } = getParts(date, timeZone);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function getWeekdayInTimeZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long" })
    .format(date)
    .toUpperCase();
}
