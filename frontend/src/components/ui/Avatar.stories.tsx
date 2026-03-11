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
