"use client";

import { useState, useRef, useEffect } from "react";
import {
  sendMessageAction,
  addMessageReactionAction,
  updatePresenceAction
} from "@/lib/actions/chat.actions";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Send, Paperclip, Image as ImageIcon, FileText, X, Check, CheckCheck, SmilePlus, MessageSquare } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function ChatRoomClient({
  userId,
  contactId,
  contactName,
  initialMessages,
}: {
  userId: string;
  contactId: string;
  contactName: string;
  initialMessages: any[];
}) {
  const [messages, setMessages] = useState<any[]>(initialMessages || []);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [isContactOnline, setIsContactOnline] = useState(true);
  const [isContactTyping, setIsContactTyping] = useState(false);
  const [activeReactionPicker, setActiveReactionPicker] = useState<string | null>(null);

  const [selectedAttachment, setSelectedAttachment] = useState<{
    name: string;
    type: "image" | "document";
    url: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isContactTyping]);

  useEffect(() => {
    updatePresenceAction(true);
    
    const presenceInterval = setInterval(() => {
      updatePresenceAction(true);
    }, 10000);

    return () => {
      clearInterval(presenceInterval);
      updatePresenceAction(false);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) {
        setIsContactOnline(prev => !prev);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      // stop typing simulation
    }, 2000);
  };

  const triggerSimulatedReply = () => {
    setTimeout(() => {
      setIsContactTyping(true);
      setTimeout(() => {
        setIsContactTyping(false);
        const replies = [
          "That sounds wonderful! I would love to connect further.",
          "Thank you for reaching out. What are your hobbies?",
          "Yes, I think our compatibility score of 88% is quite promising!",
          "Sure, let's chat about this tomorrow.",
          "I've uploaded my latest verification photos. Feel free to check them out!"
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const replyMsg = {
          id: `sim_${Date.now()}`,
          senderId: contactId,
          receiverId: userId,
          content: randomReply,
          createdAt: new Date().toISOString(),
          readAt: null,
          deliveredAt: new Date().toISOString(),
          attachments: [],
          reactions: []
        };
        setMessages(prev => [...prev, replyMsg]);
      }, 2000);
    }, 1500);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !selectedAttachment) || sending) return;

    const tempContent = content;
    const tempAttachment = selectedAttachment;
    setContent("");
    setSelectedAttachment(null);
    setSending(true);

    const attachmentResponse = tempAttachment ? [{
      id: `att_${Date.now()}`,
      name: tempAttachment.name,
      url: tempAttachment.url,
      mimeType: tempAttachment.type === "image" ? "image/png" : "application/pdf",
      fileSize: 1024 * 50
    }] : [];

    const optimisticMessage = {
      id: `opt_${Date.now()}`,
      senderId: userId,
      receiverId: contactId,
      content: tempContent || `Sent an attachment: ${tempAttachment?.name}`,
      createdAt: new Date().toISOString(),
      deliveredAt: null,
      readAt: null,
      attachments: attachmentResponse,
      reactions: []
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const res = await sendMessageAction(contactId, optimisticMessage.content);
      if (res.success) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === optimisticMessage.id) {
              return {
                ...res.message,
                attachments: attachmentResponse,
                reactions: [],
                deliveredAt: new Date().toISOString()
              };
            }
            return m;
          })
        );
        triggerSimulatedReply();
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
    } finally {
      setSending(false);
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
              reactions: reactions.filter((r: any) => !(r.userId === userId && r.reaction === emoji))
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
        url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80"
      });
    } else {
      setSelectedAttachment({
        name: "identity_proof_document.pdf",
        type: "document",
        url: "#"
      });
    }
  };

  const emojis = ["❤️", "👍", "😂", "🔥", "🎉", "😢"];

  return (
    <div className="flex-grow w-full flex flex-col justify-center items-center p-4">
      <Card className="w-full max-w-3xl h-[650px] flex flex-col border border-slate-200 bg-white shadow-xl relative overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/messages" className="text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600 to-pink-600 flex items-center justify-center font-bold text-white shadow-xs">
                {contactName.charAt(0)}
              </div>
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isContactOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">{contactName}</CardTitle>
              <span className="text-[10px] text-slate-500 font-medium">
                {isContactOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
              88% Match
            </span>
          </div>
        </CardHeader>

        <CardContent className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin bg-slate-50/30">
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs italic gap-2">
                <MessageSquare className="w-8 h-8 text-rose-300" />
                <span>Start conversation by typing a message below.</span>
              </div>
            ) : (
              messages.map((m: any) => {
                const isMe = m.senderId === userId;
                const messageReactions = m.reactions || [];
                const messageAttachments = m.attachments || [];

                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div className="relative group max-w-[70%]">
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm relative ${
                          isMe
                            ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-tr-none shadow-md shadow-rose-500/10"
                            : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/70"
                        }`}
                      >
                        <p className="leading-relaxed break-words">{m.content}</p>

                        {messageAttachments.map((att: any) => (
                          <div
                            key={att.id}
                            className={`mt-2 p-2 rounded-lg flex items-center gap-2 text-xs ${
                              isMe
                                ? "bg-black/10 border border-white/20 text-white"
                                : "bg-white border border-slate-200 text-slate-700 shadow-xs"
                            }`}
                          >
                            {att.mimeType.startsWith("image/") ? (
                              <ImageIcon className={`w-4 h-4 shrink-0 ${isMe ? "text-rose-200" : "text-rose-600"}`} />
                            ) : (
                              <FileText className={`w-4 h-4 shrink-0 ${isMe ? "text-blue-200" : "text-blue-600"}`} />
                            )}
                            <span className="truncate flex-grow font-mono text-[10px]">{att.name}</span>
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              className={`text-[10px] font-bold hover:underline shrink-0 ${
                                isMe ? "text-white" : "text-rose-600"
                              }`}
                            >
                              Download
                            </a>
                          </div>
                        ))}

                        <div
                          className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white border border-slate-200 rounded-full px-1.5 py-0.5 shadow-md z-10 ${
                            isMe ? "-left-12" : "-right-12"
                          }`}
                        >
                          <button
                            onClick={() => setActiveReactionPicker(activeReactionPicker === m.id ? null : m.id)}
                            className="text-slate-500 hover:text-slate-900"
                            type="button"
                          >
                            <SmilePlus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {activeReactionPicker === m.id && (
                        <div
                          className={`absolute -top-10 bg-white border border-slate-200 rounded-full p-1.5 flex gap-1.5 shadow-xl z-20 ${
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

                      {messageReactions.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {Array.from(new Set(messageReactions.map((r: any) => r.reaction))).map((emoji: any) => {
                            const count = messageReactions.filter((r: any) => r.reaction === emoji).length;
                            return (
                              <button
                                key={emoji}
                                onClick={() => handleAddReaction(m.id, emoji)}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors shadow-xs"
                              >
                                {emoji} {count}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400">
                      <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      {isMe && (
                        <span>
                          {m.readAt ? (
                            <CheckCheck className="w-3.5 h-3.5 text-rose-600" />
                          ) : m.deliveredAt ? (
                            <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}

            {isContactTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-xs text-slate-500"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-rose-600 border border-slate-200">
                  {contactName.charAt(0)}
                </div>
                <div className="bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </CardContent>

        {selectedAttachment && (
          <div className="px-4 py-2 border-t border-slate-100 bg-rose-50/70 flex items-center justify-between text-xs text-rose-700">
            <div className="flex items-center gap-2">
              {selectedAttachment.type === "image" ? (
                <ImageIcon className="w-4 h-4" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span className="font-semibold">{selectedAttachment.name}</span>
            </div>
            <button
              onClick={() => setSelectedAttachment(null)}
              className="text-slate-500 hover:text-slate-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <CardFooter className="border-t border-slate-100 p-4 flex flex-col gap-2 bg-white">
          <form onSubmit={handleSend} className="w-full flex gap-2">
            <div className="relative group">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 animate-fade-in"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <div className="absolute bottom-12 left-0 hidden group-hover:flex flex-col bg-white border border-slate-200 rounded-xl p-1.5 shadow-xl gap-1 z-30 min-w-[150px]">
                <button
                  type="button"
                  onClick={() => selectMockAttachment("image")}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg text-left flex items-center gap-2 whitespace-nowrap"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-rose-600" /> Share Photo
                </button>
                <button
                  type="button"
                  onClick={() => selectMockAttachment("document")}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg text-left flex items-center gap-2 whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Share Document
                </button>
              </div>
            </div>

            <Input
              type="text"
              placeholder="Type message..."
              value={content}
              onChange={handleInputChange}
              className="border-slate-200 bg-slate-50 text-slate-900 flex-grow focus-visible:ring-rose-500 placeholder:text-slate-400"
            />
            <Button
              type="submit"
              disabled={sending || (!content.trim() && !selectedAttachment)}
              className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-semibold shadow-md shadow-rose-500/20"
            >
              {sending ? <Spinner className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
