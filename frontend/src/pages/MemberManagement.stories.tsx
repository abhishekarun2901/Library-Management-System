import type { Meta, StoryObj } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"
import { MemberManagement } from "./MemberManagement"

const meta: Meta<typeof MemberManagement> = {
  title: "Pages/MemberManagement",
  component: MemberManagement,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/librarian/members"]}>
        <Story />
      </MemoryRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof MemberManagement>

export const Default: Story = {}
