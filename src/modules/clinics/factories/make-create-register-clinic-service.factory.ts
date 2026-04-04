import { ClinicMemberRepository } from "@/modules/clinic-member/repositories/clinic-member-repository";
import { SubscriptionRepository } from "@/modules/subscription/repositories/subscription-repository";
import { UserRepository } from "@/modules/user/repositories/user-respository";
import { RegisterClinicService } from "@/modules/clinics/register-clinic.service";
import { ClinicRepository } from "@/modules/clinics/repositories/clinic-repository";
import { ClinicSettingsRepository } from "@/modules/clinic-settings/repositories/clinic-settings-repository";
import { ClinicWorkingHourRepository } from "@/modules/clinic-working-hour/repositories/clinic-working-hour-repository";
import { ClinicServiceRepository } from "@/modules/clinic-service/repositories/clinic-service-repository";

export function makeCreateRegisterClinicServiceFactory() {
    const clinicRepository = new ClinicRepository();
    const userRepository = new UserRepository();
    const clinicMemberRepository = new ClinicMemberRepository();
    const subscriptionRepository = new SubscriptionRepository();
    const clinicSettingsRepository = new ClinicSettingsRepository();
    const clinicWorkingHourRepository = new ClinicWorkingHourRepository();
    const clinicServiceRepository = new ClinicServiceRepository();

    const clinicService = new RegisterClinicService(
        clinicRepository,
        userRepository,
        clinicMemberRepository,
        subscriptionRepository,
        clinicSettingsRepository,
        clinicWorkingHourRepository,
        clinicServiceRepository,
    );

    return clinicService;
}
