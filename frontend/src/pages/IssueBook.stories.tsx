import type { Meta, StoryObj } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"
import { IssueBook } from "./IssueBook"

const meta: Meta<typeof IssueBook> = {
  title: "Pages/IssueBook",
  component: IssueBook,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/librarian/issue"]}>
        <Story />
      </MemoryRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof IssueBook>

export const Default: Story = {}
