import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageCircle, X, Send, Bot, Mail, AlertCircle, HelpCircle, HeadphonesIcon, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";

const SYSTEM_CONTEXT = `You are FUTAMART AI, a friendly, warm, and professional marketplace assistant for FUTAMART — a peer-to-peer marketplace app used by students and young Nigerians to buy and sell items.

Your personality:
- Warm, encouraging, and conversational — never robotic or cold
- Patient and supportive, especially with confused or frustrated users
- Professional but approachable, like a helpful friend
- Ask follow-up questions when needed
- Guide users step-by-step when helping with tasks

You help users with:
- Buying and selling on FUTAMART
- Posting and managing listings
- Using the chat and messaging features  
- Account settings, verification, and PRO seller status
- Safety tips and scam prevention
- Navigating the app (Home, Search, Saved, Profile, Notifications)
- Understanding pricing, negotiation, and best practices
- Resolving issues and directing to support when needed

Safety guidelines:
- Always remind users to meet in safe public places
- Warn about common scams (fake payments, overpayment, etc.)
- Encourage verified sellers and PRO badges for trust

Support contact: futmartcares@gmail.com

Keep responses friendly, concise (2-4 sentences max per turn), and action-oriented. Use emojis sparingly for warmth. Never sound robotic.`;

const QUICK_ACTIONS = [
  "How do I post a listing?",
  "How do I contact a seller?",
  "Is this app safe?",
  "What is PRO seller?",
];

export default function AIChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const conversationRef = useRef([]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async (text) => {
    const userMsg = (text || input).trim();
    if (!userMsg || loading) return;
    setInput("");
    const userEntry = { role: "user", text: userMsg };
    setMessages(prev => [...prev, userEntry]);
    conversationRef.current = [...conversationRef.current, userEntry];
    setLoading(true);

    const history = conversationRef.current
      .slice(-8)
      .map(m => `${m.role === "user" ? "User" : "FUTAMART AI"}: ${m.text}`)
      .join("\n");

    const reply = await base44.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_CONTEXT}\n\nConversation history:\n${history}\n\nUser: ${userMsg}\n\nFUTAMART AI:`,
    });

    const assistantEntry = { role: "assistant", text: reply };
    setMessages(prev => [...prev, assistantEntry]);
    conversationRef.current = [...conversationRef.current, assistantEntry];
    setLoading(false);
  };

  const handleOpen = () => {
    setOpen(true);
    if (messages.length === 0) {
      setMessages([{
        role: "assistant",
        text: "👋 Hi! I'm FUTAMART AI, your marketplace assistant. I can help you buy, sell, manage listings, answer questions, and guide you around FutaMart. How can I help you today?",
        isWelcome: true,
      }]);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #FF6B00 0%, #FF8C00 50%, #FFB000 100%)",
            boxShadow: "0 4px 20px rgba(255,107,0,0.5), 0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.25)",
          }}
        >
          <Bot className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-20 right-3 z-50 w-[340px] max-w-[calc(100vw-24px)] h-[520px] bg-card border border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ background: "linear-gradient(135deg, #FF6B00, #FF8C00, #FFB000)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-heading font-bold text-white text-sm leading-none">FUTAMART AI</p>
                <p className="text-[10px] text-white/70 mt-0.5">Your marketplace assistant</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div key={i}>
                <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
                  {m.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-3 h-3 text-orange-400" />
                    </div>
                  )}
                  <div className={`max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "text-white rounded-br-sm"
                      : "bg-white/8 text-foreground rounded-bl-sm border border-white/8"
                  }`}
                    style={m.role === "user" ? {
                      background: "linear-gradient(135deg, #FF6B00, #FF8C00)",
                    } : {}}>
                    {m.text}
                  </div>
                </div>

                {/* Quick actions after welcome */}
                {m.isWelcome && i === 0 && messages.length === 1 && (
                  <div className="mt-3 ml-8 space-y-1.5">
                    {QUICK_ACTIONS.map((action, qi) => (
                      <button
                        key={qi}
                        onClick={() => send(action)}
                        className="w-full text-left px-3 py-2 rounded-xl glass text-xs text-foreground hover:border-orange-400/40 transition-all flex items-center justify-between gap-2"
                      >
                        <span>{action}</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-3 h-3 text-orange-400" />
                </div>
                <div className="bg-white/8 border border-white/8 px-3 py-2.5 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(d => (
                      <div key={d} className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce"
                        style={{ animationDelay: `${d * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Help Center */}
            {messages.length > 0 && (
              <div className="mt-3 glass rounded-2xl p-3 border border-orange-400/15">
                <p className="text-[10px] font-semibold text-orange-400 mb-2 flex items-center gap-1">
                  <HeadphonesIcon className="w-3 h-3" /> Help Center
                </p>
                <div className="space-y-1.5">
                  <a
                    href="mailto:futmartcares@gmail.com"
                    className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span className="text-[11px] text-foreground">futmartcares@gmail.com</span>
                  </a>
                  <button
                    onClick={() => send("I need to contact support")}
                    className="w-full flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
                  >
                    <HeadphonesIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="text-[11px] text-foreground">Contact Support</span>
                  </button>
                  <button
                    onClick={() => send("I want to report a problem")}
                    className="w-full flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="text-[11px] text-foreground">Report a Problem</span>
                  </button>
                  <button
                    onClick={() => send("Show me frequently asked questions")}
                    className="w-full flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="text-[11px] text-foreground">FAQ</span>
                  </button>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="p-2.5 border-t border-white/8 flex gap-2 shrink-0">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask me anything..."
              className="h-9 text-xs bg-white/5 border-white/10 rounded-xl flex-1"
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #FF6B00, #FF8C00)" }}
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
