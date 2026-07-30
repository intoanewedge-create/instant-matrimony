import { MessageResponse } from "../dto/message.dto";

export class MessageSerializer {
  static serialize(msg: MessageResponse): MessageResponse {
    return msg;
  }

  static serializeMany(msgs: MessageResponse[]): MessageResponse[] {
    return msgs.map(this.serialize);
  }
}
