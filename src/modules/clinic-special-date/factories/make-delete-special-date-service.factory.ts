import { ClinicRepository } from "@/modules/clinics/repositories/clinic-repository";
import { ClinicSpecialDateRepository } from "../repositories/clinic-special-date-repository";
import { DeleteSpecialDateService } from "../repositories/delete-special-date.service";

export default function makeDeleteSpecialDateServiceFactory() {
  const clinicRepository = new ClinicRepository();
  const clinicSpecialDateRepository = new ClinicSpecialDateRepository();
  const deleteSpecialDateService = new DeleteSpecialDateService(
    clinicRepository,
    clinicSpecialDateRepository,
  );

  return deleteSpecialDateService;
}
