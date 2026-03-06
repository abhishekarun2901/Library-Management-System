import type { Meta, StoryObj } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"
import { BookCatalog } from "./BookCatalog"

const meta: Meta<typeof BookCatalog> = {
  title: "Pages/BookCatalog",
  component: BookCatalog,
  parameters: { layout: "fullscreen" }
}

export default meta

type Story = StoryObj<typeof BookCatalog>

export const Member: Story = {
  decorators: [(Story) => <MemoryRouter initialEntries={["/member/catalog"]}><Story /></MemoryRouter>],
  args: { role: "member" }
}

export const Librarian: Story = {
  decorators: [(Story) => <MemoryRouter initialEntries={["/librarian/catalog"]}><Story /></MemoryRouter>],
  args: { role: "librarian" }
}
