import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import GlassButton from "@/components/GlassButton";
import TrustBanner from "@/components/TrustBanner";
import TypingIndicator from "@/components/chat/TypingIndicator";
import ProBadge from "@/components/ProBadge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Send, Mic, MicOff, Paperclip, Play, Pause,
  Trash2, Check, CheckCheck, Image as ImageIcon, X,
} from "lucide-react";
import { format, isToday, isYesterday, isSameDay, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import FileUploadWithCompress from "@/components/FileUploadWithCompress";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = "futmart_listings";

async function uploadToCloudinary(file, folder = "futmart/chat") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.secure_url;
}

function DateSeparator({ date }) {
  const label = isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMMM d, yyyy");
  return (
    <div className="flex items-center gap-2 my-3">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-[10px] text-muted-foreground px-2 glass rounded-full py-0.5">{label}</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

function PresenceStatus({ profile }) {
  const isOnline = profile?.is_online;
  const lastSeen = profile?.last_seen;
  let statusText = "Offline";
  let statusClass = "text-muted-foreground/60";
  let dotClass = "bg-gray-500";
  let glowStyle = {};

  if (isOnline) {
    statusText = "Online";
    statusClass = "text-emerald-400";
    dotClass = "bg-emerald-400";
    glowStyle = { filter: "drop-shadow(0 0 4px rgba(52,211,153,0.8))" };
  } else if (lastSeen) {
    statusText = `Last seen ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}`;
  }

  return (
    <div className="flex items-center gap-1.5 mt-0.5">
      <span className="relative flex h-2 w-2 shrink-0">
        {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotClass}`} style={glowStyle} />
      </span>
      <span className={`text-[10px] font-medium tracking-wide ${statusClass}`}>{statusText}</span>
    </div>
  );
}

const SWIPE_THRESHOLD = 55;
function SwipeMessage({ isMe, children, onReply }) {
  const startXRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const triggered = useRef(false);

  const onStart = (clientX) => { startXRef.current = clientX; triggered.current = false; };
  const onMove = (clientX) => {
    if (startXRef.current === null) return;
    const delta = clientX - startXRef.current;
    const valid = isMe ? delta < 0 : delta > 0;
    if (!valid) { setOffset(0); return; }
    const clamped = isMe ? Math.max(-SWIPE_THRESHOLD * 1.3, delta) : Math.min(SWIPE_THRESHOLD * 1.3, delta);
    setOffset(clamped);
    if (!triggered.current && Math.abs(clamped) >= SWIPE_THRESHOLD) {
      triggered.current = true;
      if (navigator.vibrate) navigator.vibrate(35);
    }
  };
  const onEnd = () => {
    if (triggered.current) onReply?.();
    setOffset(0);
    triggered.current = false;
    startXRef.current = null;
  };

  return (
    <div
      style={{ transform: `translateX(${offset}px)`, transition: offset === 0 ? "transform 0.22s cubic-bezier(0.25,0.46,0.45,0.94)" : "none" }}
      onTouchStart={(e) => onStart(e.touches[0].clientX)}
      onTouchMove={(e) => onMove(e.touches[0].clientX)}
      onTouchEnd={onEnd}
      onMouseDown={(e) => onStart(e.clientX)}
      onMouseMove={(e) => { if (startXRef.current !== null) onMove(e.clientX); }}
      onMouseUp={onEnd}
      onMouseLeave={() => { if (startXRef.current !== null) onEnd(); }}
    >
      {children}
    </div>
  );
}

export default function ChatRoom() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingMsgId, setPlayingMsgId] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const msgAudioRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { data: chat } = useQuery({
    queryKey: ["chat", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("chats").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: messages = [], isLoading: msgsLoading } = useQuery({
    queryKey: ["messages", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", id)
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`messages-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `chat_id=eq.${id}` },
        () => queryClient.invalidateQueries({ queryKey: ["messages", id] })
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, queryClient]);

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`chat-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chats", filter: `id=eq.${id}` },
        () => queryClient.invalidateQueries({ queryKey: ["chat", id] })
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, queryClient]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  useEffect(() => {
    if (!messages.length || !user?.id || !chat) return;
    const unread = messages.filter(m => m.sender_id !== user.id && m.transmission_state !== "read");
    if (!unread.length) return;
    (async () => {
      await supabase.from("messages").update({ transmission_state: "read" }).in("id", unread.map(m => m.id));
      const isBuyer = chat.buyer_id === user.id;
      await supabase
        .from("chats")
        .update(isBuyer ? { unread_count_buyer: 0 } : { unread_count_seller: 0 })
        .eq("id", chat.id);
      queryClient.invalidateQueries({ queryKey: ["chats-unread"] });
    })();
  }, [messages.length, chat?.id]);

  const otherName = chat?.seller_id === user?.id ? chat?.buyer_name : chat?.seller_name;
  const otherId = chat?.seller_id === user?.id ? chat?.buyer_id : chat?.seller_id;

  const { data: otherProfile } = useQuery({
    queryKey: ["other-profile", otherId],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", otherId).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!otherId,
    refetchInterval: 15000,
  });

  const { data: myProfile } = useQuery({
    queryKey: ["my-profile-chat", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const otherIsTyping = chat?.typing_user_id === otherId
    && chat?.typing_until
    && new Date(chat.typing_until) > new Date();

  const signalTyping = useCallback(() => {
    if (!chat?.id || !user?.id) return;
    const until = new Date(Date.now() + 4000).toISOString();
    supabase.from("chats").update({ typing_user_id: user.id, typing_until: until }).eq("id", chat.id);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      supabase.from("chats").update({ typing_user_id: null, typing_until: null }).eq("id", chat.id);
    }, 4000);
  }, [chat?.id, user?.id]);

  const clearTyping = useCallback(() => {
    clearTimeout(typingTimeoutRef.current);
    if (chat?.id) supabase.from("chats").update({ typing_user_id: null, typing_until: null }).eq("id", chat.id);
  }, [chat?.id]);

  const sendMessage = useMutation({
    mutationFn: async (msgData) => {
      const { data: newMsg, error } = await supabase
        .from("messages")
        .insert({
          chat_id: id,
          sender_id: user.id,
          sender_name: chat?.seller_id === user.id ? chat.seller_name : chat.buyer_name,
          transmission_state: "sent",
          ...msgData,
        })
        .select()
        .single();
      if (error) throw error;

      const isSeller = chat.seller_id === user.id;
      const currentUnread = isSeller ? (chat.unread_count_buyer || 0) : (chat.unread_count_seller || 0);
      const { error: chatError } = await supabase
        .from("chats")
        .update({
          last_message: msgData.payload_text || (msgData.attachment_type === "voice_note" ? "­ƒÄÖ´©Å Voice note" : "­ƒôÄ Attachment"),
          last_message_time: new Date().toISOString(),
          ...(isSeller ? { unread_count_buyer: currentUnread + 1 } : { unread_count_seller: currentUnread + 1 }),
        })
        .eq("id", chat.id);
      if (chatError) throw chatError;

      return newMsg;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", id] });
      queryClient.invalidateQueries({ queryKey: ["chat", id] });
    },
    onError: (err) => toast.error(err.message || "Failed to send message"),
  });

  const handleSend = () => {
    if (!text.trim()) return;
    const msgData = { payload_text: text, attachment_type: "none" };
    if (replyTo) {
      msgData.reply_to_id = replyTo.id;
      msgData.reply_to_text = replyTo.payload_text || "­ƒôÄ Attachment";
      msgData.reply_to_sender = replyTo.sender_name;
    }
    clearTyping();
    sendMessage.mutate(msgData);
    setText("");
    setReplyTo(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadToCloudinary(file);
      sendMessage.mutate({ attachment_url: url, attachment_type: "image" });
    } catch {
      toast.error("Image upload failed");
    }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("File must be under 5MB"); return; }
    try {
      const url = await uploadToCloudinary(file);
      sendMessage.mutate({ attachment_url: url, attachment_type: "document" });
    } catch {
      toast.error("Document upload failed");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mr.onstop = () => {
        setRecordedBlob(new Blob(audioChunksRef.current, { type: "audio/webm" }));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => { if (prev >= 119) { stopRecording(); return 120; } return prev + 1; });
      }, 1000);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  const previewAudio = () => {
    if (!recordedBlob) return;
    if (isPlaying) { audioPlayerRef.current?.pause(); setIsPlaying(false); return; }
    const audio = new Audio(URL.createObjectURL(recordedBlob));
    audioPlayerRef.current = audio;
    audio.onended = () => setIsPlaying(false);
    audio.play();
    setIsPlaying(true);
  };

  const sendVoice = async () => {
    if (!recordedBlob) return;
    try {
      const url = await uploadToCloudinary(new File([recordedBlob], "voice.webm", { type: "audio/webm" }));
      sendMessage.mutate({ attachment_url: url, attachment_type: "voice_note" });
      setRecordedBlob(null);
      setRecordingTime(0);
    } catch {
      toast.error("Voice note upload failed");
    }
  };

  const discardVoice = () => {
    setRecordedBlob(null);
    setRecordingTime(0);
    setIsPlaying(false);
    audioPlayerRef.current?.pause();
  };

  const playMsgVoice = (msgId, url) => {
    if (playingMsgId === msgId) { msgAudioRef.current?.pause(); setPlayingMsgId(null); return; }
    if (msgAudioRef.current) msgAudioRef.current.pause();
    const audio = new Audio(url);
    msgAudioRef.current = audio;
    audio.onended = () => setPlayingMsgId(null);
    audio.play();
    setPlayingMsgId(msgId);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const renderMsgContent = (msg) => {
    if (msg.attachment_type === "voice_note" && msg.attachment_url) {
      const playing = playingMsgId === msg.id;
      return (
        <button onClick={() => playMsgVoice(msg.id, msg.attachment_url)} className="flex items-center gap-2 py-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${playing ? "bg-orange-400/30" : "bg-white/10"}`}>
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </div>
          <span className="text-sm">Voice note</span>
        </button>
      );
    }
    if (msg.attachment_type === "document" && msg.attachment_url) {
      return <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm underline">­View document</a>;
    }
    if (msg.attachment_type === "image" && msg.attachment_url) {
      return <img src={msg.attachment_url} alt="" className="max-w-[200px] rounded-lg cursor-pointer" onClick={() => setLightboxImg(msg.attachment_url)} />;
    }
    return <p className="text-sm whitespace-pre-wrap break-words">{msg.payload_text}</p>;
  };

  const renderMessages = () => {
    const items = [];
    let lastDate = null;
    messages.forEach((msg, idx) => {
      const msgDate = msg.created_at ? new Date(msg.created_at) : null;
      if (msgDate && (!lastDate || !isSameDay(msgDate, lastDate))) {
        items.push(<DateSeparator key={`sep-${idx}`} date={msgDate} />);
        lastDate = msgDate;
      }
      const isMe = msg.sender_id === user.id;
      const isRead = msg.transmission_state === "read";
      const isDelivered = msg.transmission_state === "delivered" || isRead;

      items.push(
        <SwipeMessage
          key={msg.id}
          isMe={isMe}
          onReply={() => setReplyTo({ id: msg.id, sender_name: msg.sender_name, payload_text: msg.payload_text })}
        >
          <div className={`flex items-end gap-1.5 ${isMe ? "justify-end" : "justify-start"}`}>
            {!isMe && (
              <Link to={`/seller/${msg.sender_id}`} className="shrink-0 mb-1">
                <div className="w-7 h-7 rounded-full bg-card flex items-center justify-center text-xs font-bold text-orange-400 overflow-hidden">
                  {otherProfile?.avatar_url
                    ? <img src={otherProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                    : <span>{msg.sender_name?.[0]?.toUpperCase()}</span>}
                </div>
              </Link>
            )}

            <div className="flex flex-col gap-0.5 max-w-[80%]">
              {msg.reply_to_id && (
                <div className={`px-2 py-1 rounded-lg border-l-2 border-orange-400 text-[10px] opacity-75 mb-0.5
                  ${isMe ? "bg-orange-600/30 text-white" : "bg-white/10 text-foreground"}`}>
                  <span className="font-semibold block">{msg.reply_to_sender}</span>
                  <span className="truncate block">{msg.reply_to_text}</span>
                </div>
              )}
              <div className={`px-3 py-2 rounded-2xl ${isMe ? "bg-orange-500 text-white rounded-br-sm" : "bg-white/10 text-foreground rounded-bl-sm"}`}>
                {!isMe && otherProfile?.is_pro_seller && <div className="mb-1"><ProBadge size="sm" /></div>}
                {renderMsgContent(msg)}
                <div className={`flex items-center gap-1 mt-0.5 ${isMe ? "justify-end" : ""}`}>
                  <span className="text-[9px] opacity-60">{msgDate ? format(msgDate, "HH:mm") : ""}</span>
                  {isMe && (isDelivered
                    ? <CheckCheck className={`w-3.5 h-3.5 ${isRead ? "text-blue-300" : "opacity-60"}`} />
                    : <Check className="w-3 h-3 opacity-60" />
                  )}
                </div>
              </div>
            </div>

            {isMe && (
              <div className="shrink-0 mb-1">
                <div className="w-7 h-7 rounded-full bg-card flex items-center justify-center text-xs font-bold text-orange-400 overflow-hidden">
                  {myProfile?.avatar_url
                    ? <img src={myProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                    : <span>{msg.sender_name?.[0]?.toUpperCase()}</span>}
                </div>
              </div>
            )}
          </div>
        </SwipeMessage>
      );
    });
    return items;
  };

  return (
    <div className="flex flex-col h-[100dvh] max-w-lg mx-auto">
      <div className="glass sticky top-0 z-40 px-3 py-2.5 border-b border-white/5 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate(searchParams.get("from") === "admin" ? "/admin" : "/chats")} className="p-2 -ml-1 shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Link to={`/seller/${otherId}`} className="shrink-0">
          <div className="w-9 h-9 rounded-full bg-card overflow-hidden flex items-center justify-center text-sm font-bold text-orange-400">
            {otherProfile?.avatar_url
              ? <img src={otherProfile.avatar_url} alt="" className="w-full h-full object-cover" />
              : <span>{otherName?.[0]?.toUpperCase()}</span>}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-semibold text-sm truncate leading-tight">{otherName}</p>
            {otherProfile?.is_pro_seller && <ProBadge size="sm" />}
          </div>
          <PresenceStatus profile={otherProfile} />
          {chat?.listing_title && (
            <Link to={`/listing/${chat.listing_id}`} className="text-[10px] text-orange-400 truncate block mt-0.5">
              -À {chat.listing_title}
            </Link>
          )}
        </div>
      </div>

      <TrustBanner />

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {msgsLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">No messages yet. Say hello! ­ƒæï</p>
            <p className="text-[11px] text-muted-foreground/50 mt-1">Swipe messages to reply</p>
          </div>
        ) : renderMessages()}
        <div ref={messagesEndRef} />
      </div>

      {otherIsTyping && (
        <div className="px-3 pt-1.5 pb-0 shrink-0">
          <TypingIndicator name={otherName} />
        </div>
      )}

      {replyTo && (
        <div className="glass border-t border-white/5 px-3 py-2 flex items-center gap-2 shrink-0">
          <div className="w-0.5 h-8 bg-orange-400 rounded-full shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-orange-400 leading-tight">{replyTo.sender_name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{replyTo.payload_text || "­ƒôÄ Attachment"}</p>
          </div>
          <button onClick={() => setReplyTo(null)} className="p-1 shrink-0 rounded-full glass">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      )}

      <div className="glass border-t border-white/5 px-3 py-2.5 shrink-0">
        {recordedBlob ? (
          <div className="flex items-center gap-2">
            <GlassButton variant="ghost" size="sm" onClick={previewAudio} className="h-9 w-9 p-0">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </GlassButton>
            <span className="text-xs text-muted-foreground flex-1">{formatTime(recordingTime)}</span>
            <GlassButton variant="ghost" size="sm" onClick={discardVoice} className="h-9 w-9 p-0 text-destructive">
              <Trash2 className="w-4 h-4" />
            </GlassButton>
            <GlassButton variant="orange" size="sm" onClick={sendVoice} className="h-9 w-9 p-0">
              <Send className="w-4 h-4" />
            </GlassButton>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <label className="shrink-0 cursor-pointer p-1">
              <Paperclip className="w-5 h-5 text-muted-foreground" />
              <input type="file" className="hidden" onChange={handleDocUpload} accept=".pdf,.doc,.docx,.txt" />
            </label>
            <label className="shrink-0 cursor-pointer p-1">
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
              <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
            </label>
            <Input
              value={text}
              onChange={(e) => { setText(e.target.value); if (e.target.value) signalTyping(); else clearTyping(); }}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Message..."
              className="glass border-white/10 h-10 text-sm flex-1 rounded-full px-4"
            />
            {text.trim() ? (
              <button
                onClick={handleSend}
                className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #FF6B00,#FF8C00)", boxShadow: "0 3px 10px rgba(255,107,0,0.45)" }}
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            ) : (
              <button
                onClick={() => { if (isRecording) stopRecording(); else startRecording(); }}
                className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-all ${isRecording ? "glass-orange glow-orange animate-pulse" : "glass"}`}
              >
                {isRecording ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-muted-foreground" />}
              </button>
            )}
          </div>
        )}
        {isRecording && (
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-red-400">Recording {formatTime(recordingTime)}</span>
          </div>
        )}
      </div>

      {lightboxImg && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}
    </div>
  );
}







