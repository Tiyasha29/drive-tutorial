"use client";

import { useQuery } from "@tanstack/react-query";
import { getFolderById } from "~/server/actions";

export default function OriginalLocationForBin({ id }: {id: number}) {
  if(id === 0) {
    return <div>My Drive</div>;
  }
  const { data: server_folder } = useQuery({
      queryKey: [{ id }],
      queryFn: () => getFolderById(id),
      enabled: !!id,
      
    })
  return <div>{server_folder?.name}</div>
}