import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "../../ui/Button"
import { Input } from "../../ui/Input"
import { FormCard } from "./index"

const meta: Meta<typeof FormCard> = {
  title: "Components/Forms/FormCard",
  component: FormCard
}

export default meta

type Story = StoryObj<typeof FormCard>

export const Default: Story = {
  render: (args) => (
    <div className="bg-gray-100 p-6">
      <FormCard {...args}>
        <Input placeholder="Book title" />
        <Input placeholder="Author name" />
        <div className="flex gap-3">
          <Button>Save</Button>
          <Button variant="secondary">Cancel</Button>
        </div>
      </FormCard>
    </div>
  ),
  args: {
    title: "Book Management Form",
    description: "Create or update book details"
  }
}
