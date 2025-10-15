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
        <>
          <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24" //coordinates from (0,0) to (24, 24)
              stroke="currentColor"
              width="2em" //2 times the font size
              height="2em" 
              className="text-primary-foreground"
            >
              <path d="M9 4.5v15m7.5-7.5h-15" />
            </svg>
            <div className="text-primary-foreground">
              New
            </div>
        </>
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