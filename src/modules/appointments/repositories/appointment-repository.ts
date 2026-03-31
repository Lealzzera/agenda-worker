import { PrismaClientOrTx } from "@/types/prisma.type";
import { IAppointmentRepository, ICreateAppointment } from "./appointment-repository.interface";
import { Appointments } from "@prisma/client";

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
}