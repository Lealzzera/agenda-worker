import { prisma } from "@/db/prisma";
import { ConflictError } from "@/errors/conflict.error";
import { SignupDraftStatus } from "@prisma/client";
import { hash } from "bcrypt";
import { IUserRepository } from "../user/repositories/user-repository.interface";
import {
  ISignupDraftRepository,
  SignupDraftData,
} from "./repositories/signup-draft-repository.interface";

export interface RegisterSignupDraftServiceRequest {
  email: string;
  password: string;
  fullName: string;
  selectedPlanId: string;
  data: SignupDraftData;
  stripeCheckoutSessionId?: string;
  status?: SignupDraftStatus;
}

export class RegisterSignupDraftService {
  constructor(
    private readonly signupDraftRepository: ISignupDraftRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async exec({
    email,
    password,
    fullName,
    selectedPlanId,
    data,
    stripeCheckoutSessionId,
    status,
  }: RegisterSignupDraftServiceRequest) {
    const doesTheEmailExist = await this.userRepository.findByEmail(
      prisma,
      email,
    );

    if (doesTheEmailExist) {
      throw new ConflictError("Email provided already exists.");
    }

    const passwordHash = await hash(password, 6);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    return this.signupDraftRepository.create(prisma, {
      email,
      passwordHash,
      fullName,
      selectedPlanId,
      data,
      stripeCheckoutSessionId,
      status,
      expiresAt,
    });
  }
}
