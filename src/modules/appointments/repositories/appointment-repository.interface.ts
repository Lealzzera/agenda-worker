import { PrismaClientOrTx } from "@/types/prisma.type";
import { Appointments, AppointmentStatus } from "@prisma/client";

export interface ICreateAppointment {
    clinicId: string
    serviceId?: string
    customerPhoneNumber: string
    customerName: string
    appointmentDate: Date
    status: AppointmentStatus
    notes?: string
}

export interface IListAppointmentsFilters {
    status?: AppointmentStatus
    startDate?: Date
    endDate?: Date
}

export interface IUpdateAppointment {
    serviceId?: string | null
    customerPhoneNumber?: string
    customerName?: string
    appointmentDate?: Date
    status?: AppointmentStatus
    notes?: string | null
}

export interface IAppointmentRepository {
    create(client: PrismaClientOrTx, data: ICreateAppointment): Promise<Appointments>
    countByClinicAndDate(client: PrismaClientOrTx, clinicId: string, appointmentDate: Date): Promise<number>
    findById(client: PrismaClientOrTx, appointmentId: string): Promise<Appointments | null>
    findManyByClinicId(client: PrismaClientOrTx, clinicId: string, filters?: IListAppointmentsFilters): Promise<Appointments[]>
    update(client: PrismaClientOrTx, appointmentId: string, data: IUpdateAppointment): Promise<Appointments>
    deleteById(client: PrismaClientOrTx, appointmentId: string): Promise<void>
}
