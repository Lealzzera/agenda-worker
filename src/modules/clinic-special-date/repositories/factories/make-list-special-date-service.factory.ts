import { ClinicRepository } from "@/modules/clinics/repositories/clinic-repository";
import { ClinicSpecialDateRepository } from "../clinic-special-date-repository";
import { ListSpecialDateService } from "../list-special-date.service";

export default function makeListSpecialDateServiceFactory() {
  const clinicRepository = new ClinicRepository();
  const clinicSpecialDateRepository = new ClinicSpecialDateRepository();
  const listSpecialDateService = new ListSpecialDateService(
    clinicRepository,
    clinicSpecialDateRepository,
  );

  return listSpecialDateService;
}
