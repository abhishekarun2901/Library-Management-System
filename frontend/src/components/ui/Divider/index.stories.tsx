import type { Meta, StoryObj } from "@storybook/react"
import { Divider } from "./index"

const meta: Meta<typeof Divider> = {
  title: "Components/UI/Divider",
  component: Divider
}

export default meta

type Story = StoryObj<typeof Divider>

export const Horizontal: Story = {}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-12 items-center gap-4">
      <span className="text-sm text-gray-600">Left</span>
      <Divider orientation="vertical" />
      <span className="text-sm text-gray-600">Right</span>
    </div>
  )
}
