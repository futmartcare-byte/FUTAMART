const fs = require('fs');
const content = import { useState, useMemo, useEffect } from "react";
import {
  Bot, X, Search, ChevronDown, ChevronRight, ArrowLeft, Mail,
  HeadphonesIcon, AlertCircle, ShoppingBag, Tag, User, Shield,
  Crown, Smartphone, MessageCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const FAQ_CATEGORIES = [
  { id: "buying", label: "Buying", icon: ShoppingBag, questions: [
    { q: "How do I buy an item?", a: "Browse or search for what you need, open the listing, and tap Message Seller to start chatting." },
    { q: "How do I contact a seller?", a: "Open any listing and tap the Message Seller button to open a chat with them inside the app." },
    { q: "Can I negotiate the price?", a: "Yes! Most sellers are open to reasonable offers. Just ask politely in the chat." },
    { q: "Is it safe to buy on FUTAMART?", a: "Always meet in safe public places on campus. Never pay before inspecting the item." },
  ]},
  { id: "selling", label: "Selling", icon: Tag, questions: [
    { q: "How do I post a listing?", a: "Tap the + or Create Listing button, add photos, title, description, and price, then submit." },
    { q: "How do I edit or delete a listing?", a: "Go to your Profile, find the listing under your active ads, and tap it to edit or remove it." },
    { q: "How do buyers contact me?", a: "Buyers will message you through the in-app chat and you will get a notification." },
  ]},
  { id: "account", label: "Account & Profile", icon: User, questions: [
    { q: "How do I change my username?", a: "Go to Settings then Change Username. You can only change it once so choose carefully." },
    { q: "How do I change my password?", a: "On the login screen tap Forgot Password and follow the reset steps sent to your email." },
    { q: "What is the Verified ID badge?", a: "It is awarded once a seller reaches 50+ reviews with a 3.0+ average rating." },
  ]},
  { id: "messaging", label: "Chat & Messaging", icon: MessageCircle, questions: [
    { q: "How does messaging work?", a: "Tap Message Seller on any listing, or open an existing conversation under Chats." },
    { q: "Can I send images or voice notes?", a: "Yes, tap the paperclip icon to send a photo or the mic icon for a voice note." },
  ]},
  { id: "safety", label: "Safety & Trust", icon: Shield, questions: [
    { q: "How do I stay safe meeting a buyer or seller?", a: "Always meet in public well-lit places on campus during daytime. Bring a friend if possible." },
    { q: "What scams should I watch out for?", a: "Be cautious of fake payment screenshots or anyone pressuring you to skip meeting in person." },
    { q: "How do I report a user or listing?", a: "Open the listing or chat, tap the report icon, and describe the issue." },
  ]},
  { id: "pro", label: "PRO Seller", icon: Crown, questions: [
    { q: "What is PRO Seller?", a: "PRO Seller is an upcoming upgraded plan for sellers with extra visibility for their listings." },
    { q: "When will it be available?", a: "PRO Seller is launching soon. Check Pro Seller Plan under Settings for updates." },
  ]},
  { id: "technical", label: "App & Technical", icon: Smartphone, questions: [
    { q: "Can I install FUTAMART as an app?", a: "Yes! On Android Chrome tap Install FUTAMART in the banner. On iPhone tap Share then Add to Home Screen." },
    { q: "How do I log out?", a: "Go to your Profile, scroll down, and tap Log Out." },
  ]},
];

const ALL_QUESTIONS = FAQ_CATEGORIES.flatMap((cat) =>
  cat.questions.map((q) => ({ ...q, category: cat.label, categoryId: cat.id }))
);

const ANSWER_DELAY_MS = 500;

export default function AIChatBot() {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [search, setSearch] = useState("");

  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const term = search.trim().toLowerCase();
    return ALL_QUESTIONS.filter((item) =>
      item.q.toLowerCase().includes(term) || item.a.toLowerCase().includes(term)
    );
  }, [search]);

  useEffect(() => {
    setExpandedIndex(null);
    setLoadingIndex(null);
  }, [selectedCategory, search]);

  const handleOpen = () => { setOpen(true); setSelectedCategory(null); setExpandedIndex(null); setLoadingIndex(null); setSearch(""); };
  const handleClose = () => setOpen(false);
  const goBack = () => setSelectedCategory(null);

  const handleToggle = (i) => {
    if (expandedIndex === i) { setExpandedIndex(null); setLoadingIndex(null); return; }
    setExpandedIndex(i);
    setLoadingIndex(i);
    setTimeout(() => setLoadingIndex((cur) => (cur === i ? null : cur)), ANSWER_DELAY_MS);
  };

  const currentCategory = FAQ_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <>
      {!open && (
        <button onClick={handleOpen} className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
          style={{ background: "linear-gradient(135deg, #FF6B00 0%, #FF8C00 50%, #FFB000 100%)", boxShadow: "0 4px 20px rgba(255,107,0,0.5)" }}>
          <Bot className="w-6 h-6 text-white" />
        </button>
      )}
      {open && (
        <div className="fixed bottom-20 right-3 z-50 w-[340px] max-w-[calc(100vw-24px)] h-[520px] bg-card border border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ background: "linear-gradient(135deg, #FF6B00, #FF8C00, #FFB000)" }}>
            <div className="flex items-center gap-2.5">
              {selectedCategory && !search ? (
                <button onClick={goBack} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                  <ArrowLeft className="w-4 h-4 text-white" />
                </button>
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div>
                <p className="font-heading font-bold text-white text-sm leading-none">{currentCategory && !search ? currentCategory.label : "FUTAMART Help"}</p>
                <p className="text-[10px] text-white/70 mt-0.5">{currentCategory && !search ? "Tap a question for the answer" : "Find quick answers"}</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="p-2.5 border-b border-white/8 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search for an answer..." className="h-9 text-xs bg-white/5 border-white/10 rounded-xl pl-8" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {search.trim() ? (
              searchResults.length > 0 ? searchResults.map((item, i) => (
                <FaqItem key={i} item={item} expanded={expandedIndex === i} loading={loadingIndex === i} onToggle={() => handleToggle(i)} showCategory />
              )) : (
                <div className="text-center py-10">
                  <p className="text-sm text-muted-foreground">No matching answers found.</p>
                </div>
              )
            ) : !selectedCategory ? (
              <div className="grid grid-cols-2 gap-2">
                {FAQ_CATEGORIES.map((cat) => { const Icon = cat.icon; return (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl glass hover:border-orange-400/40 transition-all"
                    style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(251,191,36,0.04))" }}>
                    <Icon className="w-5 h-5 text-orange-400" />
                    <span className="text-[11px] font-medium text-foreground text-center leading-tight">{cat.label}</span>
                  </button>
                );})}
              </div>
            ) : (
              currentCategory.questions.map((item, i) => (
                <FaqItem key={i} item={item} expanded={expandedIndex === i} loading={loadingIndex === i} onToggle={() => handleToggle(i)} />
              ))
            )}
            <div className="mt-3 glass rounded-2xl p-3 border border-orange-400/15">
              <p className="text-[10px] font-semibold text-orange-400 mb-2 flex items-center gap-1">
                <HeadphonesIcon className="w-3 h-3" /> Still need help?
              </p>
              <div className="space-y-1.5">
                <a href="mailto:futmartcares@gmail.com" className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span className="text-[11px] text-foreground">futmartcares@gmail.com</span>
                </a>
                <a href="mailto:futmartcares@gmail.com?subject=Reporting%20a%20Problem" className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span className="text-[11px] text-foreground">Report a Problem</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FaqItem({ item, expanded, loading, onToggle, showCategory }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/8 overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left">
        <div className="flex-1 min-w-0">
          {showCategory && <span className="text-[9px] uppercase tracking-wide text-orange-400 font-semibold block mb-0.5">{item.category}</span>}
          <span className="text-xs font-medium text-foreground leading-snug">{item.q}</span>
        </div>
        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
      </button>
      {expanded && (
        <div className="px-3 pb-3 -mt-1">
          {loading ? (
            <div className="flex items-center gap-1 py-1">
              {[0,1,2].map((d) => <div key={d} className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: d*0.15+"s" }} />)}
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground leading-relaxed" style={{ animation: "futmartFadeIn 0.25s ease forwards" }}>{item.a}</p>
          )}
        </div>
      )}
      <style>{\@keyframes futmartFadeIn { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: translateY(0); } }\}</style>
    </div>
  );
};
fs.writeFileSync('src/components/AIChatBot.jsx', content, 'utf8');
console.log('Written successfully, length:', content.length);
