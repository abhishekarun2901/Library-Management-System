import type { Meta, StoryObj } from "@storybook/react"
import { Input } from "./index"

const meta: Meta<typeof Input> = {
  title: "Components/UI/Input",
  component: Input
}

export default meta

type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    placeholder: "Enter book title"
  }
}

export const Email: Story = {
  args: {
    placeholder: "Enter email",
    type: "email"
  }
}
