import type { Meta, StoryObj } from "@storybook/react"
import { QuickActionTile } from "./index"

const meta: Meta<typeof QuickActionTile> = {
  title: "Components/UI/QuickActionTile",
  component: QuickActionTile
}

export default meta

type Story = StoryObj<typeof QuickActionTile>

export const Default: Story = {
  args: {
    title: "Issue Book",
    description: "Start circulation workflow"
  }
}
