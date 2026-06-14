import { PrismaClientOrTx } from "@/types/prisma.type";
import { Appointments, AppointmentStatus, Prisma } from "@prisma/client";
import {
    IAppointmentRepository,
    ICreateAppointment,
    IListAppointmentsFilters,
    IUpdateAppointment,
} from "./appointment-repository.interface";

export class AppointmentRepository implements IAppointmentRepository {
    async create(client: PrismaClientOrTx, { appointmentDate, clinicId, customerPhoneNumber, customerName, status, notes, serviceId }: ICreateAppointment): Promise<Appointments> {
        const appointment = await client.appointments.create({
            data: {
                appointment_date: appointmentDate,
                clinic_id: clinicId,
                customer_phone_number: customerPhoneNumber,
                customer_name: customerName,
                status,
                notes,
                service_id: serviceId
            }
        })
        return appointment
    }

    async countByClinicAndDate(client: PrismaClientOrTx, clinicId: string, appointmentDate: Date): Promise<number> {
        const count = await client.appointments.count({
            where: {
                clinic_id: clinicId,
                appointment_date: appointmentDate,
                status: {
                    notIn: [
                        AppointmentStatus.CANCELED_BY_CLINIC,
                        AppointmentStatus.CANCELED_BY_PATIENT,
                    ],
                },
            },
        })
        return count
    }

    async findById(client: PrismaClientOrTx, appointmentId: string): Promise<Appointments | null> {
        const appointment = await client.appointments.findUnique({
            where: { id: appointmentId },
        })
        return appointment
    }

    async findManyByClinicId(client: PrismaClientOrTx, clinicId: string, filters?: IListAppointmentsFilters): Promise<Appointments[]> {
        const whereCondition: Prisma.AppointmentsWhereInput = {
            clinic_id: clinicId,
        }

        if (filters?.status) {
            whereCondition.status = filters.status
        }

        if (filters?.startDate || filters?.endDate) {
            whereCondition.appointment_date = {}
            if (filters.startDate) {
                whereCondition.appointment_date.gte = filters.startDate
            }
            if (filters.endDate) {
                whereCondition.appointment_date.lte = filters.endDate
            }
        }

        const appointments = await client.appointments.findMany({
            where: whereCondition,
            orderBy: { appointment_date: "asc" },
        })
        return appointments
    }

    async update(client: PrismaClientOrTx, appointmentId: string, data: IUpdateAppointment): Promise<Appointments> {
        const updatedAppointment = await client.appointments.update({
            where: { id: appointmentId },
            data: {
                ...(data.appointmentDate !== undefined && { appointment_date: data.appointmentDate }),
                ...(data.customerPhoneNumber !== undefined && { customer_phone_number: data.customerPhoneNumber }),
                ...(data.customerName !== undefined && { customer_name: data.customerName }),
                ...(data.status !== undefined && { status: data.status }),
                ...(data.notes !== undefined && { notes: data.notes }),
                ...(data.serviceId !== undefined && { service_id: data.serviceId }),
            },
        })
        return updatedAppointment
    }

    async deleteById(client: PrismaClientOrTx, appointmentId: string): Promise<void> {
        await client.appointments.delete({
            where: { id: appointmentId },
        })
    }
}
