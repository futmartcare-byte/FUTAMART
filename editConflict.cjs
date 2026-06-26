const fs = require("fs");
const path = "src/pages/ChatList.jsx";
let c = fs.readFileSync(path, "utf8");
c = c.replace(/\r\n/g, "\n");
c = c.replace(
`      const { data: chat, error } = await supabase
        .from("chats")
        .insert({
          listing_id: "00000000-0000-0000-0000-000000000000",
          listing_title: "Customer Support",
          listing_image: SUPPORT_AVATAR,
          listing_price: null,
          seller_id: SUPPORT_USER_ID,
          seller_name: SUPPORT_NAME,
          seller_avatar: SUPPORT_AVATAR,
          buyer_id: user.id,
          buyer_name: myProfile?.full_name || "User",
          buyer_avatar: myProfile?.avatar_url || "",
        })
        .select()
        .single();
      if (error) throw error;
      return chat;`,
`      const { data: chat, error } = await supabase
        .from("chats")
        .insert({
          listing_id: "00000000-0000-0000-0000-000000000000",
          listing_title: "Customer Support",
          listing_image: SUPPORT_AVATAR,
          listing_price: null,
          seller_id: SUPPORT_USER_ID,
          seller_name: SUPPORT_NAME,
          seller_avatar: SUPPORT_AVATAR,
          buyer_id: user.id,
          buyer_name: myProfile?.full_name || "User",
          buyer_avatar: myProfile?.avatar_url || "",
        })
        .select()
        .single();
      if (error) {
        if (error.code === "23505") {
          const { data: existing2 } = await supabase
            .from("chats")
            .select("id")
            .eq("buyer_id", user.id)
            .eq("seller_id", SUPPORT_USER_ID)
            .maybeSingle();
          return existing2;
        }
        throw error;
      }
      return chat;`
);
fs.writeFileSync(path, c, "utf8");
console.log("Done");
