import type { Meta, StoryObj } from "@storybook/react"
import { Select } from "./Select"

const meta: Meta<typeof Select> = {
  title: "Components/UI/Select",
  component: Select
}

export default meta

type Story = StoryObj<typeof Select>

export const Default: Story = {
  args: {
    placeholder: "Select category",
    defaultValue: "",
    options: [
      { label: "Fiction", value: "fiction" },
      { label: "Science", value: "science" },
      { label: "History", value: "history" }
    ]
  }
}
