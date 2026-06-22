import { ClinicServiceRepository } from "../repositories/clinic-service-repository";
import { UpdateClinicServicesService } from "../update-clinic-services.service";

export default function makeUpdateClinicServicesServiceFactory() {
  const clinicServiceRepository = new ClinicServiceRepository();
  return new UpdateClinicServicesService(clinicServiceRepository);
}
