import { ClinicRepository } from "@/modules/clinics/repositories/clinic-repository";
import { ClinicSpecialDateRepository } from "../repositories/clinic-special-date-repository";
import { UpdateSpecialDateService } from "../repositories/update-special-date.service";

export default function makeUpdateSpecialDateServiceFactory() {
  const clinicRepository = new ClinicRepository();
  const clinicSpecialDateRepository = new ClinicSpecialDateRepository();
  const updateSpecialDateService = new UpdateSpecialDateService(
    clinicRepository,
    clinicSpecialDateRepository,
  );

  return updateSpecialDateService;
}
