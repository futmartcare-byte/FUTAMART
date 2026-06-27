const LISTING_ACCOUNTS = [
  { cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME, preset: "futmart_listings" },
  { cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME_3, preset: "futamart_all" },
];

const CHAT_ACCOUNT = { cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME_2, preset: "futamart_listings" };
const AVATAR_ACCOUNT = { cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME, preset: "futmart_listings" };
const NOTIF_ACCOUNT = { cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME_3, preset: "futamart_all" };

export async function uploadToCloudinary(file, folder = "futmart/listings") {
  let account;

  if (folder.includes("chat")) {
    account = CHAT_ACCOUNT;
  } else if (folder.includes("avatars")) {
    account = AVATAR_ACCOUNT;
  } else if (folder.includes("notifications")) {
    account = NOTIF_ACCOUNT;
  } else {
    // Listings alternate between account 1 and 3
    account = LISTING_ACCOUNTS[Math.floor(Date.now() / 1000) % 2];
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", account.preset);
  formData.append("folder", folder);

  const res = await fetch(
    https://api.cloudinary.com/v1_1//auto/upload,
    { method: "POST", body: formData }
  );
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.secure_url;
}
