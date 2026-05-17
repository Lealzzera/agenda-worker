import { ClinicRepository } from "@/modules/clinics/repositories/clinic-repository";
import { ClinicSpecialDateRepository } from "../clinic-special-date-repository";
import { CreateSpecialDateService } from "../create-special-date.service";

export default function makeCreateSpecialDateServiceFactory() {
  const clinicRepository = new ClinicRepository();
  const createSpecialDateRepository = new ClinicSpecialDateRepository();
  const createSpecialDateService = new CreateSpecialDateService(
    clinicRepository,
    createSpecialDateRepository,
  );

  return createSpecialDateService;
}
