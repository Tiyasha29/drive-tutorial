export function formatFileSize( fileSizeInBytes: number ) {
  let fileSizeInKB = 0;
       let fileSizeInMB = 0;
       let fileSizeInGB = 0;
       let fileSize = 0;
       let fileSizeUnit: "bytes" | "KB" | "MB" | "GB" = "bytes";

      if(fileSizeInBytes >= 1073741824) { 
        fileSizeInGB = parseFloat((fileSizeInBytes / 1073741824).toFixed(2))
        fileSize = fileSizeInGB;
        fileSizeUnit = "GB";
      }
      else if (fileSizeInBytes >= 1048576) {
        fileSizeInMB = parseFloat((fileSizeInBytes / 1048576).toFixed(2))
        fileSize = fileSizeInMB;
        fileSizeUnit = "MB";
      }
      else if (fileSizeInBytes >= 1024){
        fileSizeInKB = parseFloat((fileSizeInBytes / 1024).toFixed(2))
        fileSize = fileSizeInKB;
        fileSizeUnit = "KB";
      }

      return { fileSize, fileSizeUnit };
}