import { IClinicRepository } from "./repositories/clinic-repository.interface";

interface IRegisterClinicRequest {
    name: string;
    slug: string;
    cnpj: string;
    phone: string;
    email: string;
    address: string;
    postal_code: string;
    city: string;
    state: string;
}

interface IRegisterClinicResponse {
    clinic: {
        id: string;
        name: string;
        slug: string;
        cnpj: string;
        phone: string;
        email: string;
        address: string;
        postal_code: string;
        city: string;
        state: string;
    };
}

export class RegisterClinicService {
    constructor(private readonly clinicRepository: IClinicRepository) {}
    async exec({name, slug, cnpj, phone, email, address, postal_code, city, state}: IRegisterClinicRequest): Promise<any> {

    }
}