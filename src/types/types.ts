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
