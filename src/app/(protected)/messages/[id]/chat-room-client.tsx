"use client";

import { useState, useRef, useEffect } from "react";
import {
  sendMessageAction,
  getChatMessagesAction,
  addMessageReactionAction,
  updatePresenceAction,
  deleteMessageAction,
} from "@/lib/actions/chat.actions";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  ArrowLeft,
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
  Check,
  CheckCheck,
  SmilePlus,
  MessageSquare,
  Trash2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function ChatRoomClient({
  userId,
  contactId,
  contactName,
  contactPhoto,
  initialMessages,
}: {
  userId: string;
  contactId: string;
  contactName: string;
  contactPhoto?: string | null;
  initialMessages: any[];
  isMobileView?: boolean;
}) {
  const [messages, setMessages] = useState<any[]>(initialMessages || []);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeReactionPicker, setActiveReactionPicker] = useState<string | null>(null);

  const [selectedAttachment, setSelectedAttachment] = useState<{
    name: string;
    type: "image" | "document";
    url: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    updatePresenceAction(true);

    const presenceInterval = setInterval(() => {
      updatePresenceAction(true);
    }, 15000);

    return () => {
      clearInterval(presenceInterval);
      updatePresenceAction(false);
    };
  }, []);

  // Polling synchronization every 4 seconds while conversation is open
  useEffect(() => {
    let isMounted = true;
    const pollInterval = setInterval(async () => {
      try {
        const res = await getChatMessagesAction(contactId);
        if (res.success && res.messages && isMounted) {
          setMessages((prev) => {
            const optimistic = prev.filter((m) => m.id?.startsWith?.("opt_"));
            const fetchedIds = new Set(res.messages.map((m: any) => m.id));
            const remainingOptimistic = optimistic.filter((o) => !fetchedIds.has(o.id));

            const prevNonOptIds = prev
              .filter((m) => !m.id?.startsWith?.("opt_"))
              .map((m) => m.id)
              .join(",");
            const newIds = res.messages.map((m: any) => m.id).join(",");

            if (prevNonOptIds === newIds && remainingOptimistic.length === 0) {
              return prev;
            }
            return [...remainingOptimistic, ...res.messages];
          });
        }
      } catch {
        // Silently ignore background polling errors
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [contactId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !selectedAttachment) || sending) return;

    setErrorMessage(null);
    const tempContent = content.trim();
    const tempAttachment = selectedAttachment;
    setContent("");
    setSelectedAttachment(null);
    setSending(true);

    const attachmentResponse = tempAttachment
      ? [
          {
            id: `att_${Date.now()}`,
            name: tempAttachment.name,
            url: tempAttachment.url,
            mimeType: tempAttachment.type === "image" ? "image/png" : "application/pdf",
            fileSize: 1024 * 50,
          },
        ]
      : [];

    const optimisticMessage = {
      id: `opt_${Date.now()}`,
      senderId: userId,
      receiverId: contactId,
      content: tempContent || `Sent an attachment: ${tempAttachment?.name}`,
      createdAt: new Date().toISOString(),
      deliveredAt: null,
      readAt: null,
      attachments: attachmentResponse,
      reactions: [],
    };

    setMessages((prev) => [optimisticMessage, ...prev]);

    try {
      const res = await sendMessageAction(contactId, optimisticMessage.content);
      if (res.success && res.message) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === optimisticMessage.id) {
              return {
                ...res.message,
                attachments: attachmentResponse,
                reactions: [],
                deliveredAt: new Date().toISOString(),
              };
            }
            return m;
          })
        );
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
        setErrorMessage(res.error || "Failed to send message.");
        setContent(tempContent);
      }
    } catch (err: any) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      setErrorMessage(err.message || "An unexpected network error occurred.");
      setContent(tempContent);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    setConfirmDeleteId(null);
    setDeletingId(messageId);
    setErrorMessage(null);

    const targetMsg = messages.find((m) => m.id === messageId);
    if (!targetMsg) return;

    // Optimistic removal
    setMessages((prev) => prev.filter((m) => m.id !== messageId));

    try {
      const res = await deleteMessageAction(messageId, contactId);
      if (!res.success) {
        // Restore message if error
        setMessages((prev) => [targetMsg, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setErrorMessage(res.error || "Failed to delete message.");
      }
    } catch (err: any) {
      setMessages((prev) => [targetMsg, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setErrorMessage(err.message || "Could not delete message.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    setActiveReactionPicker(null);
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === messageId) {
          const reactions = m.reactions ? [...m.reactions] : [];
          const existing = reactions.find((r: any) => r.userId === userId && r.reaction === emoji);
          if (existing) {
            return {
              ...m,
              reactions: reactions.filter((r: any) => !(r.userId === userId && r.reaction === emoji)),
            };
          } else {
            reactions.push({ id: `r_${Date.now()}`, userId, reaction: emoji });
            return { ...m, reactions };
          }
        }
        return m;
      })
    );

    try {
      await addMessageReactionAction(messageId, emoji);
    } catch {
      // ignore
    }
  };

  const selectMockAttachment = (type: "image" | "document") => {
    if (type === "image") {
      setSelectedAttachment({
        name: "profile_photo_verified.png",
        type: "image",
        url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
      });
    } else {
      setSelectedAttachment({
        name: "horoscope_biodata.pdf",
        type: "document",
        url: "#",
      });
    }
  };

  const emojis = ["❤️", "👍", "😂", "🔥", "🎉", "🙏"];

  // Sort messages chronologically for chat bubble display (oldest first at top, newest at bottom)
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <Card className="w-full h-[calc(100vh-100px)] md:h-[680px] flex flex-col border border-gray-200 bg-white shadow-xl relative overflow-hidden rounded-2xl">
        {/* Header */}
        <CardHeader className="border-b border-gray-100 bg-gray-50/90 p-3.5 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Link
              href="/messages"
              className="p-1.5 rounded-xl hover:bg-gray-200 transition-colors text-gray-600 flex items-center gap-1 font-semibold text-xs"
              title="Back to Conversations"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white shadow-xs overflow-hidden">
                {contactPhoto ? (
                  <img src={contactPhoto} alt={contactName} className="w-full h-full object-cover" />
                ) : (
                  <span>{contactName.charAt(0)}</span>
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-gray-900">{contactName}</CardTitle>
              <span className="text-[10px] text-emerald-600 font-medium">Verified Active Candidate</span>
            </div>
          </div>
        </CardHeader>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="bg-rose-50 border-b border-rose-200 p-2.5 flex items-center justify-between text-xs text-rose-700 font-medium shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Message Thread Content */}
        <CardContent className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/40">
          <AnimatePresence initial={false}>
            {sortedMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs italic gap-2 py-12">
                <MessageSquare className="w-8 h-8 text-emerald-400" />
                <span>No messages yet. Send a message to start conversing!</span>
              </div>
            ) : (
              sortedMessages.map((m: any) => {
                const isMe = m.senderId === userId;
                const messageReactions = m.reactions || [];
                const messageAttachments = m.attachments || [];

                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div className="relative group max-w-[85%] sm:max-w-[70%]">
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm relative ${
                          isMe
                            ? "bg-emerald-600 text-white rounded-tr-none shadow-xs"
                            : "bg-white text-gray-800 rounded-tl-none border border-gray-200 shadow-xs"
                        }`}
                      >
                        <p className="leading-relaxed break-words whitespace-pre-wrap">{m.content}</p>

                        {messageAttachments.map((att: any) => (
                          <div
                            key={att.id}
                            className={`mt-2 p-2 rounded-lg flex items-center gap-2 text-xs ${
                              isMe
                                ? "bg-black/10 border border-white/20 text-white"
                                : "bg-gray-50 border border-gray-200 text-gray-700 shadow-xs"
                            }`}
                          >
                            {att.mimeType?.startsWith("image/") ? (
                              <ImageIcon
                                className={`w-4 h-4 shrink-0 ${isMe ? "text-emerald-200" : "text-emerald-600"}`}
                              />
                            ) : (
                              <FileText className={`w-4 h-4 shrink-0 ${isMe ? "text-blue-200" : "text-blue-600"}`} />
                            )}
                            <span className="truncate flex-grow font-mono text-[10px]">{att.name}</span>
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              className={`text-[10px] font-bold hover:underline shrink-0 ${
                                isMe ? "text-white" : "text-emerald-600"
                              }`}
                            >
                              Download
                            </a>
                          </div>
                        ))}

                        {/* Hover Action Menu */}
                        <div
                          className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white border border-gray-200 rounded-full px-1.5 py-0.5 shadow-md z-10 ${
                            isMe ? "-left-16" : "-right-16"
                          }`}
                        >
                          <button
                            onClick={() => setActiveReactionPicker(activeReactionPicker === m.id ? null : m.id)}
                            className="text-gray-500 hover:text-gray-900 p-1"
                            title="React"
                            type="button"
                          >
                            <SmilePlus className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete option ONLY for own sent messages */}
                          {isMe && (
                            <button
                              onClick={() => setConfirmDeleteId(m.id)}
                              disabled={deletingId === m.id}
                              className="text-gray-400 hover:text-rose-600 p-1 transition-colors"
                              title="Delete message"
                              type="button"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Confirmation Modal Popover for Message Delete */}
                      {confirmDeleteId === m.id && (
                        <div
                          className={`absolute -top-12 bg-white border border-rose-200 rounded-xl p-2 flex items-center gap-2 shadow-xl z-30 ${
                            isMe ? "right-0" : "left-0"
                          }`}
                        >
                          <span className="text-[10px] font-bold text-gray-700 whitespace-nowrap">Delete message?</span>
                          <button
                            onClick={() => handleDeleteMessage(m.id)}
                            className="px-2 py-0.5 bg-rose-600 text-white font-bold text-[10px] rounded hover:bg-rose-700 transition-colors"
                          >
                            Yes, Delete
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 font-bold text-[10px] rounded hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {/* Emoji Picker Popup */}
                      {activeReactionPicker === m.id && (
                        <div
                          className={`absolute -top-10 bg-white border border-gray-200 rounded-full p-1.5 flex gap-1.5 shadow-xl z-20 ${
                            isMe ? "right-0" : "left-0"
                          }`}
                        >
                          {emojis.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleAddReaction(m.id, emoji)}
                              className="hover:scale-125 transition-transform text-sm"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Displayed Emoji Reactions */}
                      {messageReactions.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {Array.from(new Set(messageReactions.map((r: any) => r.reaction))).map((emoji: any) => {
                            const count = messageReactions.filter((r: any) => r.reaction === emoji).length;
                            return (
                              <button
                                key={emoji}
                                onClick={() => handleAddReaction(m.id, emoji)}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 transition-colors shadow-xs"
                              >
                                {emoji} {count}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Timestamp & Delivery Indicators */}
                    <div className="flex items-center gap-1 mt-1 text-[9px] text-gray-400">
                      <span>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {isMe && (
                        <span>
                          {m.readAt ? (
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          ) : m.deliveredAt ? (
                            <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-gray-400" />
                          )}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Selected Attachment Preview */}
        {selectedAttachment && (
          <div className="px-4 py-2 border-t border-gray-100 bg-emerald-50/70 flex items-center justify-between text-xs text-emerald-700 shrink-0">
            <div className="flex items-center gap-2">
              {selectedAttachment.type === "image" ? (
                <ImageIcon className="w-4 h-4" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span className="font-semibold">{selectedAttachment.name}</span>
            </div>
            <button onClick={() => setSelectedAttachment(null)} className="text-gray-500 hover:text-gray-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Composer Footer */}
        <CardFooter className="border-t border-gray-100 p-3.5 flex flex-col gap-2 bg-white shrink-0 sticky bottom-0">
          <form onSubmit={handleSend} className="w-full flex gap-2">
            <div className="relative group">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <div className="absolute bottom-12 left-0 hidden group-hover:flex flex-col bg-white border border-gray-200 rounded-xl p-1.5 shadow-xl gap-1 z-30 min-w-[150px]">
                <button
                  type="button"
                  onClick={() => selectMockAttachment("image")}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg text-left flex items-center gap-2 whitespace-nowrap"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-600" /> Share Photo
                </button>
                <button
                  type="button"
                  onClick={() => selectMockAttachment("document")}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg text-left flex items-center gap-2 whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Share Document
                </button>
              </div>
            </div>

            <Input
              type="text"
              placeholder="Type message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border-gray-200 bg-gray-50 text-gray-900 flex-grow focus-visible:ring-emerald-500 placeholder:text-gray-400 text-xs sm:text-sm"
            />
            <Button
              type="submit"
              disabled={sending || (!content.trim() && !selectedAttachment)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs shrink-0"
            >
              {sending ? <Spinner className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
