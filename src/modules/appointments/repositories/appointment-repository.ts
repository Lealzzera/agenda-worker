import { PrismaClientOrTx } from "@/types/prisma.type";
import { IAppointmentRepository, ICreateAppointment } from "./appointment-repository.interface";
import { Appointments, AppointmentStatus } from "@prisma/client";

export class AppointmentRepository implements IAppointmentRepository {
    async create(client: PrismaClientOrTx, { appointmentDate, clinicId, customerPhoneNumber, status, notes, serviceId }: ICreateAppointment): Promise<Appointments> {
        const appointment = await client.appointments.create({
            data: {
                appointment_date: appointmentDate,
                clinic_id: clinicId,
                customer_phone_number: customerPhoneNumber,
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
                    notIn: [AppointmentStatus.CANCELED],
                },
            },
        })
        return count
    }
}