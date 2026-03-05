import type { Meta, StoryObj } from "@storybook/react"
import { StatCard } from "./index"

const meta: Meta<typeof StatCard> = {
  title: "Components/UI/StatCard",
  component: StatCard
}

export default meta

type Story = StoryObj<typeof StatCard>

export const Default: Story = {
  args: {
    label: "Total Books",
    value: "1,248"
  }
}
