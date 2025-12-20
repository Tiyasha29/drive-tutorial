import { MUTATIONS, QUERIES } from "~/server/db/queries";

export async function subtractFromFolderSizeAllParents(input: {
  size: number;
  parentFolderId: number;
}) {
  let currentParentFolder = await QUERIES.getFolderById(input.parentFolderId);

  while (currentParentFolder) {
    await MUTATIONS.subtractFromFolderSize({
      sizeInBytes: input.size,
      folderId: currentParentFolder.id,
    });

    // If this folder has no parent, stop climbing
    if (!currentParentFolder.parent || currentParentFolder.parent === 0) {
      break;
    }

    currentParentFolder = await QUERIES.getFolderById(
      currentParentFolder.parent,
    );
  }
}
