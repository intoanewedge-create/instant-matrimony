import { BaseService } from "./base.service";
import { Result } from "../result";
import { IInterestRepository } from "../repositories/interfaces/interest.repository";
import { PermissionService } from "./permission.service";
import { NotificationService } from "./notification.service";
import { eventDispatcher } from "../events/event-dispatcher";
import { DOMAIN_EVENTS } from "@/constants";

export class InterestService extends BaseService {
  constructor(
    private interestRepository: IInterestRepository,
    private permissionService: PermissionService,
    private notificationService: NotificationService
  ) {
    super();
  }

  async sendInterest(senderId: string, receiverId: string): Promise<Result<any>> {
    try {
      const allowed = await this.permissionService.canSendInterest(senderId, receiverId);
      if (!allowed) {
        return this.returnFailure(
          "You cannot send an interest to this profile (either blocked, or duplicate interest already exists).",
          "INTEREST_NOT_ALLOWED"
        );
      }

      const interest = await this.interestRepository.create(senderId, receiverId);

      await eventDispatcher.publish(DOMAIN_EVENTS.INTEREST_SENT, {
        interestId: interest.id,
        senderId,
        receiverId,
      });

      await this.notificationService.enqueue(
        receiverId,
        "New Interest Received",
        "Someone is interested in your profile. View interests to respond!",
        "INFO"
      );

      return this.returnSuccess(interest);
    } catch (e: any) {
      return this.returnFailure(e.message, "INTEREST_SEND_ERROR");
    }
  }

  async acceptInterest(receiverId: string, interestId: string): Promise<Result<any>> {
    try {
      const allowed = await this.permissionService.canAcceptInterest(receiverId, interestId);
      if (!allowed) {
        return this.returnFailure("You cannot accept this interest request.", "INTEREST_ACCEPT_NOT_ALLOWED");
      }

      const updated = await this.interestRepository.updateStatus(interestId, "ACCEPTED");

      await eventDispatcher.publish(DOMAIN_EVENTS.INTEREST_ACCEPTED, {
        interestId,
        senderId: updated.senderId,
        receiverId,
      });

      await this.notificationService.enqueue(
        updated.senderId,
        "Interest Accepted!",
        "Your match interest request has been accepted. You can now start chatting!",
        "SUCCESS"
      );

      return this.returnSuccess(updated);
    } catch (e: any) {
      return this.returnFailure(e.message, "INTEREST_ACCEPT_ERROR");
    }
  }

  async declineInterest(receiverId: string, interestId: string): Promise<Result<any>> {
    try {
      const interest = await this.interestRepository.findById(interestId);
      if (!interest || interest.receiverId !== receiverId) {
        return this.returnFailure("Interest request not found", "INTEREST_NOT_FOUND");
      }

      const updated = await this.interestRepository.updateStatus(interestId, "DECLINED");
      return this.returnSuccess(updated);
    } catch (e: any) {
      return this.returnFailure(e.message, "INTEREST_DECLINE_ERROR");
    }
  }

  async withdrawInterest(senderId: string, interestId: string): Promise<Result<any>> {
    try {
      const interest = await this.interestRepository.findById(interestId);
      if (!interest || interest.senderId !== senderId) {
        return this.returnFailure("Interest request not found", "INTEREST_NOT_FOUND");
      }

      const updated = await this.interestRepository.updateStatus(interestId, "WITHDRAWN");
      return this.returnSuccess(updated);
    } catch (e: any) {
      return this.returnFailure(e.message, "INTEREST_WITHDRAW_ERROR");
    }
  }
}
