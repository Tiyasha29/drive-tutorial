import { MUTATIONS, QUERIES } from "~/server/db/queries";

export async function updateLastModifiedAtAllParents(parentFolderId: number) {
  let currentParentFolder = await QUERIES.getFolderById(parentFolderId);

  while (currentParentFolder) {
    await MUTATIONS.updateLastModifiedAtFolder(currentParentFolder.id);

    // If this folder has no parent, stop climbing
    if (!currentParentFolder.parent || currentParentFolder.parent === 0) {
      break;
    }

    currentParentFolder = await QUERIES.getFolderById(
      currentParentFolder.parent,
    );
  }
}
