import { ClinicRepository } from "@/modules/clinics/repositories/clinic-repository";
import { ClinicSpecialDateRepository } from "../clinic-special-date-repository";
import { DeleteSpecialDateService } from "../delete-special-date.service";

export default function makeDeleteSpecialDateServiceFactory() {
  const clinicRepository = new ClinicRepository();
  const clinicSpecialDateRepository = new ClinicSpecialDateRepository();
  const deleteSpecialDateService = new DeleteSpecialDateService(
    clinicRepository,
    clinicSpecialDateRepository,
  );

  return deleteSpecialDateService;
}
