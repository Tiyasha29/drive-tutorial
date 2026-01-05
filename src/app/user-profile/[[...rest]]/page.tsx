// import { UserProfile } from '@clerk/nextjs'

// const UserProfilePage = () => <UserProfile />

// export default UserProfilePage

import { auth, currentUser } from "@clerk/nextjs/server"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { Badge } from "~/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { getUserById } from "~/server/actions"
import dayjs from "dayjs"
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { PencilIcon } from "lucide-react"
import ProfilePicture from "~/components/profile-picture"

export default async function UserProfilePage() {
  const { userId } = await auth()
  const user = await currentUser()


  if (!userId || !user) return null

  const server_user = await getUserById(userId);

  dayjs.extend(localizedFormat);
  const formattedDateAccountCreated = dayjs(new Date(user.createdAt ?? "")).format('lll');
  const formattedDateLastLogin = dayjs(new Date(user.lastSignInAt ?? "")).format('lll');

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>

      <Card>
        <CardHeader className="flex flex-row items-center gap-6">
          <ProfilePicture imageUrl={user.imageUrl} firstName={user.firstName ?? ""}/>

          <div className="flex-1">
            <CardTitle className="text-xl">
              {user.fullName}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {user.primaryEmailAddress?.emailAddress}
            </p>

            <div className="mt-2 flex gap-2">
              <Badge variant="secondary">Free Plan</Badge>
            </div>
          </div>

          <Button variant="outline">Edit Profile</Button>
        </CardHeader>

        <Separator />

        <CardContent className="grid gap-6 pt-6">
          {/* Account Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem
              label="User ID"
              value={user.id}
            />
            <InfoItem
              label="Account Created"
              value={formattedDateAccountCreated}
            />
            <InfoItem
              label="Last Login"
              value={formattedDateLastLogin}
            />
            <InfoItem
              label="Auth Provider"
              value={user.externalAccounts[0]?.provider || "Email"}
            />
          </div>

          <Separator />

          {/* Storage section */}
          <div>
            <h3 className="font-medium mb-2">Storage</h3>
            <p className="text-sm text-muted-foreground">
              {server_user?.sizeUsed} {server_user?.sizeUnitUsed} used of 10 MB
            </p>

            <div className="mt-2 h-2 w-full rounded bg-muted">
              <div className="h-2 rounded bg-blue-500" style={{ width: `${(((server_user?.sizeInBytesUsed ?? 0) / 10485760) * 100).toFixed(2)}%`}} />
            </div>

            <Button size="sm" className="mt-4">
              Upgrade Storage
            </Button>
          </div>
        </CardContent>
      </Card>
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
