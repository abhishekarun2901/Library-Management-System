import type { Meta, StoryObj } from "@storybook/react"
import { Input } from "../ui"
import { FormField } from "./FormField"

const meta: Meta<typeof FormField> = {
  title: "Composite/FormField",
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
