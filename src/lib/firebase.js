import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAUvXmpsENY8C8F6tdL4Sl87EdFiFCETQI",
  authDomain: "futamart-1.firebaseapp.com",
  projectId: "futamart-1",
  storageBucket: "futamart-1.firebasestorage.app",
  messagingSenderId: "507410495541",
  appId: "1:507410495541:web:bea85b78bfdfb03a74597c"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const VAPID_KEY = "BISyP6Spd2u5g2xas1z5tw2Ju-PgElBx793Tpr-tXQPdgGsJoWX-lNNJD7YmhDw9yjyRuSUBIOLv5vW81Zpb6Lk";

export async function requestNotificationPermission(userId, supabase) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const registration = await navigator.serviceWorker.register('/sw.js');
    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
    if (!token) return null;

    await supabase.from("push_tokens").upsert(
      { user_id: userId, token, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
    return token;
  } catch (err) {
    console.error("Notification permission error:", err);
    return null;
  }
}

export async function sendChatNotification(toUserId, fromUsername, message, supabase) {
  try {
    const { data } = await supabase.from("push_tokens").select("token").eq("user_id", toUserId).single();
    if (!data?.token) return;

    const session = await supabase.auth.getSession();
    const accessToken = session.data.session?.access_token;

    const res = await fetch("https://nuigjwriojnzkehlgbrh.supabase.co/functions/v1/send-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + accessToken,
      },
      body: JSON.stringify({
        token: data.token,
        title: "FutaMart • " + fromUsername,
        body: message.length > 80 ? message.slice(0, 80) + "..." : message,
      }),
    });

    const result = await res.json();
    console.log("Notification result:", result);
  } catch (err) {
    console.error("Send notification error:", err);
  }
}

export { messaging, onMessage };