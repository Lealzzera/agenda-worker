import { ClinicRepository } from "@/modules/clinics/repositories/clinic-repository";
import { ClinicSettingsRepository } from "../repositories/clinic-settings-repository";
import { UpdateClinicSettingsService } from "../update-clinic-settings.service";

export default function makeUpdateClinicSettingsServiceFactory() {
  const clinicRepository = new ClinicRepository();
  const clinicSettingsRepository = new ClinicSettingsRepository();
  return new UpdateClinicSettingsService(
    clinicRepository,
    clinicSettingsRepository,
  );
}
