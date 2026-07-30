import { UserProfile, RecommendationContext } from "../../domain/contracts";

export class BioTemplateBuilder {
  static build(bio: string, occupation?: string): string {
    const occPart = occupation ? ` working as a ${occupation}` : "";
    return `Create a polished, engaging, and professional matchmaking biography based on the user's raw inputs:\nRaw Bio: "${bio}"${occPart}.\nProvide a natural, structured paragraph covering their profession, outlook, and what they seek in a partner. Keep it premium, respectful, and appealing.`;
  }
}

export class IcebreakerTemplateBuilder {
  static build(sender: UserProfile, receiver: UserProfile): string {
    return `Generate 3 personalized, polite, and engaging icebreaker conversation starter messages from a ${sender.gender.toLowerCase()} sender named ${sender.name} to a ${receiver.gender.toLowerCase()} recipient named ${receiver.name}.\n` +
      `Sender Context: Occupation: ${sender.occupation || "N/A"}, City: ${sender.city || "N/A"}, Education: ${sender.education || "N/A"}.\n` +
      `Recipient Context: Occupation: ${receiver.occupation || "N/A"}, City: ${receiver.city || "N/A"}, Education: ${receiver.education || "N/A"}.\n` +
      `Focus on shared career fields, city locations, or common interests to initiate clean and attractive dialogue.`;
  }
}

export class CompatibilityTemplateBuilder {
  static build(context: RecommendationContext): string {
    const { viewer, candidate } = context;
    return `Explain the matchmaking compatibility between ${viewer.name} and ${candidate.name}.\n` +
      `Viewer Profile: Gender: ${viewer.gender}, City: ${viewer.city || "N/A"}, Religion: ${viewer.religion || "N/A"}, Education: ${viewer.education || "N/A"}, Occupation: ${viewer.occupation || "N/A"}.\n` +
      `Candidate Profile: Gender: ${candidate.gender}, City: ${candidate.city || "N/A"}, Religion: ${candidate.religion || "N/A"}, Education: ${candidate.education || "N/A"}, Occupation: ${candidate.occupation || "N/A"}.\n` +
      `Highlight matching locations, similar educational/occupational lines, and compatibility percentages.`;
  }
}

export class ConversationTemplateBuilder {
  static build(convoHistory: { senderName: string; text: string }[]): string {
    const historyString = convoHistory.map((m) => `${m.senderName}: ${m.text}`).join("\n");
    return `Based on the conversation history below, suggest the next 3 relevant, engaging responses to maintain a flow:\n${historyString}`;
  }
}
