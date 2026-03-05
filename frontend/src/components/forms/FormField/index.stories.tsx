import type { Meta, StoryObj } from "@storybook/react"
import { Input } from "../../ui/Input"
import { FormField } from "./index"

const meta: Meta<typeof FormField> = {
  title: "Components/Forms/FormField",
  component: FormField
}

export default meta

type Story = StoryObj<typeof FormField>

export const Default: Story = {
  render: (args) => (
    <FormField {...args}>
      <Input id="book-title" placeholder="Enter book title" />
    </FormField>
  ),
  args: {
    label: "Book Title",
    htmlFor: "book-title",
    helperText: "Use a clear and descriptive title."
  }
}
