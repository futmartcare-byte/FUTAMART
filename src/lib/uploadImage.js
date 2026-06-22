const LISTINGS_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;     // Account 1 — listings
const GENERAL_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME_2;    // Account 2 — avatars, chat, notifications
const UPLOAD_PRESET = "futmart_listings";

async function tryUpload(cloudName, file, folder, resourceType) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.secure_url;
}

export async function uploadToCloudinary(file, folder, resourceType = "image") {
  const isListing = folder?.startsWith("futmart/listings");
  const primary = isListing ? LISTINGS_CLOUD : (GENERAL_CLOUD || LISTINGS_CLOUD);
  const backup = isListing ? GENERAL_CLOUD : LISTINGS_CLOUD;
  try {
    return await tryUpload(primary, file, folder, resourceType);
  } catch (err) {
    console.warn("Upload failed on primary, trying backup...", err.message);
    if (backup && backup !== primary) return await tryUpload(backup, file, folder, resourceType);
    throw err;
  }
}

