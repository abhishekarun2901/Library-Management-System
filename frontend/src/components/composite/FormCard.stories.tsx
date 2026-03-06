import type { Meta, StoryObj } from "@storybook/react"
import { Button, Input } from "../ui"
import { FormCard } from "./FormCard"

const meta: Meta<typeof FormCard> = {
  title: "Composite/FormCard",
  component: FormCard
}

export default meta

type Story = StoryObj<typeof FormCard>

export const Default: Story = {
  render: (args) => (
    <div className="bg-gray-100 p-6">
      <FormCard
        {...args}
        footer={
          <div className="flex gap-3">
            <Button>Save</Button>
            <Button variant="secondary">Cancel</Button>
          </div>
        }
      >
        <Input placeholder="Book title" />
        <Input placeholder="Author name" />
      </FormCard>
    </div>
  ),
  args: {
    title: "Book Management Form",
    description: "Create or update book details"
  }
}
