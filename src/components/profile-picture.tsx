"use client";

import { clerkClient, type User } from "@clerk/nextjs/server";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { PencilIcon } from "lucide-react";
import { useRef } from "react";
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";
import { updateProfilePictureUrl } from "~/server/actions";
import { useRouter } from "next/navigation";


export default function ProfilePicture({ imageUrl, firstName } : { imageUrl: string, firstName: string }) {

  const { user } = useUser();  
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if(!file) return;
    if(user) {
      await user?.setProfileImage({file});
      await user.reload();
      const updatedProfilePicture = user?.imageUrl;
      updateProfilePictureUrl({ profilePictureUrl: user.imageUrl, userId: user.id})
      router.refresh();
    }
    
  }

  function handleProfilePictureClick() {
    fileInputRef.current?.click();
  }

  return <>
    <Avatar className="h-20 w-20">
      <AvatarImage src={imageUrl} />
      <button className="absolute right-1 bottom-1" onClick={handleProfilePictureClick}>
        <PencilIcon/>
      </button>
      <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <AvatarFallback>
                {firstName?.[0]}
        </AvatarFallback>
      </Avatar>
  </>
}