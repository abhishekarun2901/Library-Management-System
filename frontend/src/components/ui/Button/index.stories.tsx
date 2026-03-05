import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "./index"

const meta: Meta<typeof Button> = {
  title: "Components/UI/Button",
  component: Button
}

export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    children: "Search",
    variant: "primary"
  }
}

export const Secondary: Story = {
  args: {
    children: "Edit",
    variant: "secondary"
  }
}

export const Danger: Story = {
  args: {
    children: "Delete",
    variant: "danger"
  }
}
