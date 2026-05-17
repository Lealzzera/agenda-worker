import { ClinicRepository } from "@/modules/clinics/repositories/clinic-repository";
import { ClinicSpecialDateRepository } from "../repositories/clinic-special-date-repository";
import { ListSpecialDateService } from "../repositories/list-special-date.service";

export default function makeListSpecialDateServiceFactory() {
  const clinicRepository = new ClinicRepository();
  const clinicSpecialDateRepository = new ClinicSpecialDateRepository();
  const listSpecialDateService = new ListSpecialDateService(
    clinicRepository,
    clinicSpecialDateRepository,
  );

  return listSpecialDateService;
}
