import { ClinicRepository } from "@/modules/clinics/repositories/clinic-repository";
import { ListClinicSettingsService } from "../list-clinic-settings.service";
import { ClinicSettingsRepository } from "../repositories/clinic-settings-repository";

export default function makeListClinicSettingsServiceFactory() {
  const clinicRepository = new ClinicRepository();
  const clinicSettingsRepository = new ClinicSettingsRepository();
  return new ListClinicSettingsService(
    clinicRepository,
    clinicSettingsRepository,
  );
}
