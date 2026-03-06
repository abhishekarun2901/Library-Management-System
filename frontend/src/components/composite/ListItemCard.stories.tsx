import type { Meta, StoryObj } from "@storybook/react"
import { Badge } from "../ui"
import { ListItemCard } from "./ListItemCard"

const meta: Meta<typeof ListItemCard> = {
  title: "Composite/ListItemCard",
  component: ListItemCard
}

export default meta

type Story = StoryObj<typeof ListItemCard>

export const Default: Story = {
  args: {
    title: "The Pragmatic Programmer",
    subtitle: "Andrew Hunt, David Thomas",
    meta: "ISBN: 978-0201616224",
    action: <Badge label="Available" variant="available" />
  }
}
