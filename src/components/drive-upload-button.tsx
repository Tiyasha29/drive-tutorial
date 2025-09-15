"use client";
import { useRouter } from "next/navigation";
import { UploadButton } from "./uploadthing";

export default function DriveUploadButton(props: {folderId: number}) {

  const router = useRouter();
  
  return (
    <UploadButton endpoint="driveUploader" input={{folderId: props.folderId}} onClientUploadComplete={() => {
      router.refresh();
    }}/>
  )
}