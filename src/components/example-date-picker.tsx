"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import { Label } from "~/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useUser } from "@clerk/nextjs"
import { MUTATIONS, QUERIES } from "~/server/db/queries"
import { useRouter } from "next/navigation"
import { getDOBByUserId, updateDOBByUserId } from "~/server/actions"
import dayjs from "dayjs"

export function Calendar22({userId}: {userId: string}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false)
  //const [date, setDate] = React.useState<Date | undefined>(undefined)

  const { data: server_dob } = useQuery({
    queryKey: [userId.concat("dob")],
    queryFn: () => getDOBByUserId(userId),
  })

  const { mutate: server_updateDOB } = useMutation({
      mutationFn: updateDOBByUserId,
  
      onSuccess: () => {
        router.refresh();
      }
    })


  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-48 justify-between font-normal"
          >
            {server_dob ? server_dob.toLocaleDateString() : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={server_dob === null ? undefined: server_dob}
            captionLayout="dropdown"
            onSelect={(date) => {
              //setDate(date)
              server_updateDOB({userId, dob: date})
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
