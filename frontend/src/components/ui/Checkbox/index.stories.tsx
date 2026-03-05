import type { Meta, StoryObj } from "@storybook/react"
import { Checkbox } from "./index"

const meta: Meta<typeof Checkbox> = {
  title: "Components/UI/Checkbox",
  component: Checkbox
}

export default meta

type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
  args: {
    label: "Remember me"
  }
}
