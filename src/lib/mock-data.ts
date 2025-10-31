export interface File {
  id: string
  name: string
  type: "file"
  url: string
  parent: string
  size: string
}

export type Folder = {
  id: string
  name: string
  type: "folder"
  parent: string | null
}

export const mockFolders: Folder[] = [
  { id: "1", name: "Documents", type: "folder", parent: null},
  { id: "2", name: "Images", type: "folder", parent: null},
  { id: "3", name: "Work", type: "folder", parent: null},
  { id: "4", name: "Presentations", type: "folder", parent: null },
  { id: "5", name: "Vacation", type: "folder", parent: null },
  { id: "6", name: "Videos", type: "folder", parent: null },
  { id: "7", name: "Groceries", type: "folder", parent: null },
  { id: "8", name: "Course Materials", type: "folder", parent: null },
  { id: "9", name: "Lesson Plans", type: "folder", parent: null },
  { id: "10", name: "Resumes", type: "folder", parent: null },
  { id: "11", name: "Family", type: "folder", parent: null },
]

export const mockFiles: File[] = [
  { id: "4", name: "Resume.pdf", type: "file", url: "/files/resume.pdf", parent: "root", size: "1.2 MB" },
  { id: "5", name: "Project Proposal.docx", type: "file", url: "/files/proposal.docx", parent: "3", size: "2.5 MB" },
  { id: "6", name: "Vacation.jpg", type: "file", url: "/files/vacation.jpg", parent: "2", size: "3.7 MB" },
  { id: "7", name: "Profile Picture.png", type: "file", url: "/files/profile.png", parent: "1", size: "1.8 MB" },
  { id: "9", name: "Q4 Report.pptx", type: "file", url: "/files/q4-report.pptx", parent: "3", size: "5.2 MB" },
  { id: "10", name: "Budget.xlsx", type: "file", url: "/files/budget.xlsx", parent: "3", size: "1.5 MB" },
]

