# Drive Tutorial

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## TODO

- [ x ] Set up databse and data model
- [ x ] Move folder open state to url
- [ x ] Add auth
- [ x ] Add file uploading
- [ x ] Add analytics
- [ x ] Make sure sort order is consistent
- [ x ] Add delete
- [ ] Real homepage + onboarding

## Fun follow ups

## Folder deletions

Make sure you fetch all of the folders that have it as a parent, and their children too.

## Folder creations - also short description, use a tag or colour
Make a server action that takes a name and parentId, and creates a folder with that name and parentId (don't forget to set the ownerId).

## Access control
Check if user is owner before showing the folder page.

## Make a "file view" page
You get the idea. Maybe check out my last tutorial?

## Toasts!
Gray out a row while it's being deleted and show dialog - Are you sure you want to delete? - show file name and size


## Better UI
## Plus icon to upload files in bottom right
## SVG for no record found
## Dark theme and light theme toggle - nexttheme (in shadcn)
## Clerk - should stay in website route only, all possible authentications.
## Show folder type
## Show nearest file size properly - make custom function for this.
## Upload UI improvement.
## Invalidate query for deletion and addition so that only the list API is called again, not the other elements.
## Show x GB/y GB left.
## Remove sandbox, implemment seed logic at database level.
## Use pagination while querying data from database - don't fetch bulk records at once. - page number, limit, total records (showing x/y records)
## Database level search functionality on basis of folder/file name.
## Debounce functionality for search - useDebounce
## React virtualization for showing listing page.
## Use slug in url - index the database in slug.
## Tiles and listing layout for folders.
## Use shadcn data table to show folders and files.
## Bulk Delete - move to recyle bin, don't delete from database.

At last!!!

## Remove UploadThing, use Amazon S3
## Remove Clerk and use betterAuth or supertokens