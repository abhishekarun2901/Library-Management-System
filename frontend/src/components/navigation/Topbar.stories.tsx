import type { Meta, StoryObj } from "@storybook/react"
import { Topbar } from "./Topbar"

const meta: Meta<typeof Topbar> = {
  title: "Navigation/Topbar",
  component: Topbar,
  parameters: { layout: "fullscreen" }
}

export default meta

type Story = StoryObj<typeof Topbar>

/** Gradient indigo-to-purple topbar — default librarian view */
export const Default: Story = {
  args: {
    title: "Librarian Dashboard",
    userName: "Sarah Librarian"
  }
}

/** Topbar showing member context */
export const MemberView: Story = {
  args: {
    title: "My Activity",
    userName: "Alex Johnson"
  }
}
