import type { Meta, StoryObj } from "@storybook/react"
import { Spinner } from "./index"

const meta: Meta<typeof Spinner> = {
  title: "Components/UI/Spinner",
  component: Spinner
}

export default meta

type Story = StoryObj<typeof Spinner>

export const Default: Story = {}

export const Large: Story = {
  args: {
    size: "lg"
  }
}
