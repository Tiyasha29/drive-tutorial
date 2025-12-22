"use client"

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"

import { Button } from "./ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"
import UploadDropDownFileAndFolder from "./upload-dropdown-file-and-folder"
import { Progress } from "./ui/progress"
import { QUERIES } from "~/server/db/queries"
import { useMutation, useQuery } from "@tanstack/react-query"
import { getUserById } from "~/server/actions"

export function NavMain({
  items, folderId, userId
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[], folderId: number, userId: string
}) {

  const { data: server_user } = useQuery({
    queryKey: [{ userId }],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
    
  })

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <UploadDropDownFileAndFolder folderId={folderId}/>
            {/* <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">Inbox</span>
            </Button> */}
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <a href={`${item.url}`}>
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
              </a>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <Progress value={((server_user?.sizeInBytesUsed ?? 0) / 10485760) * 100}/>
            <p className="mt-2">{server_user?.sizeUsed} {server_user?.sizeUnitUsed} of 10 MB used ({(((server_user?.sizeInBytesUsed ?? 0) / 10485760) * 100).toFixed(2)} % full)</p>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
