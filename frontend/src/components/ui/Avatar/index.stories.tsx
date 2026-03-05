import type { Meta, StoryObj } from "@storybook/react"
import { Avatar } from "./index"

const meta: Meta<typeof Avatar> = {
  title: "Components/UI/Avatar",
  component: Avatar
}

export default meta

type Story = StoryObj<typeof Avatar>

export const Default: Story = {
  args: {
    src: "https://i.pravatar.cc/100",
    alt: "Library member"
  }
}
