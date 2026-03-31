import { PrismaClientOrTx } from "@/types/prisma.type";
import { Appointments, AppointmentStatus } from "@prisma/client";

export interface ICreateAppointment {
    clinicId: string
    serviceId?: string
    customerPhoneNumber: string
    appointmentDate: Date
    status: AppointmentStatus
    notes?: string
}

export interface IAppointmentRepository {
    create(client: PrismaClientOrTx, { clinicId, serviceId, customerPhoneNumber, appointmentDate, status, notes }: ICreateAppointment): Promise<Appointments>
}