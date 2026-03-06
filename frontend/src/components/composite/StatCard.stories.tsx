import type { Meta, StoryObj } from "@storybook/react"
import { StatCard } from "./StatCard"

const meta: Meta<typeof StatCard> = {
  title: "Composite/StatCard",
  component: StatCard
}

export default meta

type Story = StoryObj<typeof StatCard>

export const Default: Story = {
  args: {
    label: "Total Books",
    value: "2,847"
  }
}

export const Financial: Story = {
  args: {
    label: "Outstanding Fines",
    value: "$11.00"
  }
}

export const SmallCount: Story = {
  args: {
    label: "Pending Returns",
    value: "23"
  }
}
