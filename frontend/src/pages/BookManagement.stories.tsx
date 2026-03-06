import type { Meta, StoryObj } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"
import { BookManagement } from "./BookManagement"

const meta: Meta<typeof BookManagement> = {
  title: "Pages/BookManagement",
  component: BookManagement,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/librarian/books"]}>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
}

export default meta
type Story = StoryObj<typeof BookManagement>

export const Default: Story = {}
