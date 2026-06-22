import { ClinicRepository } from "@/modules/clinics/repositories/clinic-repository";
import { ListAllWorkingHourService } from "../list-all-working-hour.service";
import { ClinicWorkingHourRepository } from "../repositories/clinic-working-hour-repository";

export default function makeListAllWorkingHourServiceFactory() {
  const clinicRepository = new ClinicRepository();
  const clinicWorkingHourRepository = new ClinicWorkingHourRepository();
  const listAllWorkingHourService = new ListAllWorkingHourService(
    clinicRepository,
    clinicWorkingHourRepository,
  );
  return listAllWorkingHourService;
}
