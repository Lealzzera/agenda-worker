import { ClinicServiceRepository } from "../repositories/clinic-service-repository";
import { ListClinicServicesService } from "../list-clinic-services.service";

export default function makeListClinicServicesServiceFactory() {
  const clinicServiceRepository = new ClinicServiceRepository();
  return new ListClinicServicesService(clinicServiceRepository);
}
