import type { Meta, StoryObj } from "@storybook/react"
import { Badge } from "./index"

const meta: Meta<typeof Badge> = {
  title: "Components/UI/Badge",
  component: Badge
}

export default meta

type Story = StoryObj<typeof Badge>

export const Available: Story = {
  args: {
    label: "Available",
    variant: "available"
  }
}

export const Reserved: Story = {
  args: {
    label: "Reserved",
    variant: "reserved"
  }
}

export const Issued: Story = {
  args: {
    label: "Issued",
    variant: "issued"
  }
}

export const Overdue: Story = {
  args: {
    label: "Overdue",
    variant: "overdue"
  }
}
