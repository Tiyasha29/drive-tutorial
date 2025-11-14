"use client";
import { useRouter } from "next/navigation";
import { UploadButton } from "./uploadthing";

export default function DriveUploadButton(props: {folderId: number}) {

  const router = useRouter();
  
  return (
    <UploadButton endpoint="driveUploader" 
    input={{folderId: props.folderId}} 
    appearance={{
      button: "bg-primary rounded-md px-4 py-2 hover:bg-primary/80"
    }}
    content={{
      button: (
            <div className="text-primary-foreground">
              File Upload
            </div>
      ),
      allowedContent: (
        <></>
      )
    }}
    onClientUploadComplete={() => {
      router.refresh();
    }}/>
  )
}