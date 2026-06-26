const fs = require("fs");
const path = "src/pages/Notifications.jsx";
let c = fs.readFileSync(path, "utf8");
c = c.replace(/\r\n/g, "\n"); // normalize line endings first

c = c.replace(
  `      <div className="px-4 py-2.5 border-b border-white/5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all"
              style={filter === f.value ? {
                background: "linear-gradient(135deg,#FF6B00,#FFB000)", color: "white",
                boxShadow: "0 2px 8px rgba(255,107,0,0.4)",
              } : {
                background: "var(--glass-bg)", backdropFilter: "blur(var(--glass-blur))",
                border: "1px solid var(--glass-border)", color: "hsl(var(--muted-foreground))",
              }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

`,
  ``
);

c = c.replace(
  `                    <div className="flex items-center gap-2 mt-1.5">
                      {n.from_name && <span className="text-[10px] text-muted-foreground/70">From: {n.from_name}</span>}
                      {n.from_name && n.created_at && <span className="text-[10px] text-muted-foreground/40">\u00b7</span>}
                      <span className="text-[10px] text-muted-foreground/50">
                        {n.created_at ? formatDistanceToNow(new Date(n.created_at), { addSuffix: true }) : ""}
                      </span>
                    </div>`,
  `                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-muted-foreground/50">
                        {n.created_at ? formatDistanceToNow(new Date(n.created_at), { addSuffix: true }) : ""}
                      </span>
                    </div>`
);

c = c.replace(
  `  const deleteNotif = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("notifications").update({ is_deleted: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });`,
  `  const deleteNotif = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("notifications").update({ is_deleted: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const setReaction = useMutation({
    mutationFn: async ({ id, reaction, current }) => {
      const next = current === reaction ? null : reaction;
      const { error } = await supabase.from("notifications").update({ reaction: next }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });`
);

c = c.replace(
  `                  <button onClick={(e) => { e.stopPropagation(); deleteNotif.mutate(n.id); }}
                    className="p-1.5 rounded-lg hover:text-red-400 text-muted-foreground shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>`,
  `                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); setReaction.mutate({ id: n.id, reaction: "like", current: n.reaction }); }}
                      className={\`p-1.5 rounded-lg transition-colors \${n.reaction === "like" ? "text-green-400" : "hover:text-green-400 text-muted-foreground"}\`}>
                      <ThumbsUp className="w-3.5 h-3.5" fill={n.reaction === "like" ? "currentColor" : "none"} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setReaction.mutate({ id: n.id, reaction: "dislike", current: n.reaction }); }}
                      className={\`p-1.5 rounded-lg transition-colors \${n.reaction === "dislike" ? "text-red-400" : "hover:text-red-400 text-muted-foreground"}\`}>
                      <ThumbsDown className="w-3.5 h-3.5" fill={n.reaction === "dislike" ? "currentColor" : "none"} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteNotif.mutate(n.id); }}
                      className="p-1.5 rounded-lg hover:text-red-400/70 text-muted-foreground">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>`
);

fs.writeFileSync(path, c, "utf8");
console.log("Done");
