"use client";

import type { User } from "@clerk/nextjs/server";
import { IconEdit } from "@tabler/icons-react";
import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { Calendar22 } from "./example-date-picker";
import { useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getGenderByUserId, updateGenderByUserId } from "~/server/actions";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function EditableUserDetails({createdAt, lastSignInAt, userId}: {createdAt: number, lastSignInAt: number|null, userId: string}) {

  dayjs.extend(localizedFormat);
  const formattedDateAccountCreated = dayjs(new Date(createdAt ?? "")).format('lll');
  const formattedDateLastLogin = dayjs(new Date(lastSignInAt ?? "")).format('lll');

  const router = useRouter();

  const { data: server_gender } = useQuery({
      queryKey: [userId.concat("gender")],
      queryFn: () => getGenderByUserId(userId),
    })

  const { mutate: server_updateGender } = useMutation({
        mutationFn: updateGenderByUserId,
    
        onSuccess: () => {
          router.refresh();
        }
      })

  const genders: ("Male" | "Female" | "Third Gender" | "Prefer not to disclose")[] = ["Male", "Female", "Third Gender", "Prefer not to disclose"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Date of Birth</p>
              <Calendar22 userId={userId}/>
            </div>
            <InfoItem
              label="Account Created"
              value={formattedDateAccountCreated}
            />
            <InfoItem
              label="Last Login"
              value={formattedDateLastLogin}
            />
            <div>
              <p className="text-xs text-muted-foreground">Gender</p>
              <Select value={server_gender ? server_gender : ""} onValueChange={(gender) => {
                server_updateGender({ userId, gender: gender as "Male" | "Female" | "Third Gender" | "Prefer not to disclose" })
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select gender"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Gender</SelectLabel>
                    {genders.map((gender) => (
                      <SelectItem
                      key={gender}
                      value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
  )
}

function InfoItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium truncate">{value}</p>
    </div>
  )
}