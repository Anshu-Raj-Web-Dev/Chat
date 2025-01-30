import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [newName, setNewName] = useState(authUser?.fullName || ""); // For the name update
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (optional)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      alert("File size is too large. Please upload a smaller image.");
      return;
    }

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);

      try {
        await updateProfile({ profilePic: base64Image });
        console.log("Profile image uploaded successfully.");
      } catch (error) {
        console.error("Error uploading profile image:", error);
        alert("Failed to upload image. Please try again.");
      }
    };

    reader.onerror = (error) => {
      console.error("File reader error:", error);
      alert("Error reading file. Please try again.");
    };
  };

  useEffect(() => {
    setNewName(authUser?.fullName || "");
  }, [authUser?.fullName]);

  const handleNameChange = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const res = await updateProfile({ fullName: newName });
  
      if (res && res.user) {
        useAuthStore.setState((state) => ({
          authUser: { ...state.authUser, ...res.user },
        }));
      } else {
        console.error("Invalid response structure:", res);
        toast.to("Failed to update name.");
      }
  
      console.log("Profile name updated successfully.");
    } catch (error) {
      console.error("Error updating name:", error);
      toast.to("Failed to update name. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveImage = async () => {
    setIsSubmitting(true);
  
    try {
      await updateProfile({ profilePic: null });
  
      // Reset local state and global store
      setSelectedImg(null);
      useAuthStore.setState((state) => ({
        authUser: { ...state.authUser, profilePic: null },
      }));
  
      toast.success("Profile image removed successfully.");
    } catch (error) {
      console.error("Error removing profile image:", error);
      toast.error("Failed to remove profile image. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  
  return (
    <div className="h-screen pt-20 profile-page">
       <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Itim&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Parkinsans:wght@300..800&family=Playwrite+VN:wght@100..400&display=swap');        .profile-page {
          font-family: "Montserrat", serif;
          font-weight: 400;
        }
        `}
      </style>
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar upload section */}
          <div className="flex flex-col items-center gap-4">
  <div className="relative">
    <img
      src={selectedImg || authUser.profilePic || "/avatar.png"}
      alt="Profile"
      className="size-32 rounded-full object-cover border-4"
    />
    {/* Upload Image Button */}
    <label
      htmlFor="avatar-upload"
      className={`absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${
        isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
      }`}
    >
      <Camera className="w-5 h-5 text-base-200" />
      <input
        type="file"
        id="avatar-upload"
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={isUpdatingProfile}
      />
    </label>
  </div>

  {/* Remove Image Button */}
  {authUser.profilePic && (
  <button
    onClick={handleRemoveImage}
    className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg disabled:bg-gray-300 transition-all hover:bg-red-700"
    disabled={isUpdatingProfile}
  >
    {isUpdatingProfile ? "Removing..." : "Remove Image"}
  </button>
)}


  <p className="text-sm text-zinc-400">
    {isUpdatingProfile ? "Updating..." : "Click the camera icon to update your photo"}
  </p>
</div>


          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <form onSubmit={handleNameChange} className="px-4 py-2.5 bg-base-200 rounded-lg border">
  <input
    type="text"
    value={newName}
    onChange={(e) => setNewName(e.target.value)}
    className="w-full bg-base-200 border-none outline-none"
    placeholder="Enter new name"
  />
  <button
    type="submit"
    disabled={isSubmitting}
    className="mt-2 px-4 py-2 text-xs bg-blue-600 text-white rounded-lg disabled:bg-gray-300 transition-all hover:bg-blue-800"
  >
    {isSubmitting ? "Updating..." : "Update Name"}
  </button>
</form>

            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
