import { prisma } from "@/db/prisma";
import { IUserRepository } from "./repositories/user-repository.interface";

export class CheckUserEmailService {
  constructor(private userRepository: IUserRepository) {}

  async exec(email: string) {
    const user = await this.userRepository.findByEmail(prisma, email);
    if (user) {
      return { exists: true };
    }
    return { exists: false };
  }
}
