import { ClinicRepository } from "@/modules/clinics/repositories/clinic-repository";
import { UpdateWorkingHourService } from "../update-working-hour.service";
import { ClinicWorkingHourRepository } from "../repositories/clinic-working-hour-repository";

export default function makeUpdateWorkingHourServiceFactory() {
  const clinicRepository = new ClinicRepository();
  const clinicWorkingHourRepository = new ClinicWorkingHourRepository();

  return new UpdateWorkingHourService(
    clinicRepository,
    clinicWorkingHourRepository,
  );
}
