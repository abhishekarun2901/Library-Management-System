import type { Meta, StoryObj } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { librarianSidebarItems } from "../../config/sidebarConfig"

const meta: Meta<typeof Sidebar> = {
  title: "Navigation/Sidebar",
  component: Sidebar,
  decorators: [(Story) => <MemoryRouter initialEntries={["/librarian"]}><Story /></MemoryRouter>],
  parameters: { layout: "fullscreen" },
}

export default meta

type Story = StoryObj<typeof Sidebar>

/** Librarian navigation — 7 items with Lucide icons, Dashboard active */
export const Default: Story = {
  args: { title: "BooKing", items: librarianSidebarItems },
}
