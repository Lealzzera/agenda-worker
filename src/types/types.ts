import { Weekday } from "@prisma/client";

export interface IWorkingHourInput {
  weekday: Weekday;
  startTime: string;
  endTime: string;
}

export interface IServiceInput {
  name: string;
  durationMinutes: number;
  priceCents?: number;
}

export interface ISettingsInput {
  chargesEvaluation?: boolean;
  evaluationPriceCents?: number;
}

export const WEEKDAY_BY_INDEX: Weekday[] = [
  Weekday.SUNDAY,
  Weekday.MONDAY,
  Weekday.TUESDAY,
  Weekday.WEDNESDAY,
  Weekday.THURSDAY,
  Weekday.FRIDAY,
  Weekday.SATURDAY,
];

export type Periods = {
  startTime: string;
  endTime: string;
};

export interface ICreateClinicSpecialDate {
  clinicId: string;
  specialDate: string;
  isOpen: boolean;
  periods?: Periods[];
  note?: string | null;
}

export interface WahaMessagePayload {
  id?: string;
  event: string;
  payload: {
    ack: number;
    body: string;
    chatId?: string;
    from: string;
    fromMe: boolean;
    hasMedia: boolean;
    id?: string;
    notifyName?: string;
    source: string;
    timestamp: number;
    to?: string;
  };
  session: string;
}

export interface WahaMessageAckPayload {
  id?: string;
  event: string;
  payload: {
    ack: number;
    ackName?: string;
    chatId?: string;
    from: string;
    fromMe: boolean;
    id?: string;
    participant?: string | null;
    to?: string;
  };
  session: string;
}
