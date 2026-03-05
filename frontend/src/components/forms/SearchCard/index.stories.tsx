import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "../../ui/Button"
import { Input } from "../../ui/Input"
import { SearchCard } from "./index"

const meta: Meta<typeof SearchCard> = {
  title: "Components/Forms/SearchCard",
  component: SearchCard
}

export default meta

type Story = StoryObj<typeof SearchCard>

export const Default: Story = {
  render: (args) => (
    <div className="bg-gray-100 p-6">
      <SearchCard {...args}>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <Input placeholder="Search catalog" />
          <Button>Search</Button>
        </div>
      </SearchCard>
    </div>
  ),
  args: {
    title: "Catalog Search",
    description: "Find books by title, author, or ISBN"
  }
}
