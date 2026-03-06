import type { Meta, StoryObj } from "@storybook/react"
import { Avatar } from "./Avatar"

const meta: Meta<typeof Avatar> = {
  title: "Components/UI/Avatar",
  component: Avatar
}

export default meta

type Story = StoryObj<typeof Avatar>

/** Default — generic user placeholder icon */
export const Default: Story = {
  args: {}
}

/** With initials — pass text children to show member initials */
export const WithInitials: Story = {
  args: {
    children: "AJ",
    className: "bg-indigo-100 text-indigo-700 font-semibold text-sm"
  }
}
