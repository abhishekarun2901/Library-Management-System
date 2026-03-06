import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "../ui"
import { PageHeader } from "./PageHeader"

const meta: Meta<typeof PageHeader> = {
  title: "Layout/PageHeader",
  component: PageHeader
}

export default meta

type Story = StoryObj<typeof PageHeader>

export const Default: Story = {
  args: {
    title: "Catalog Search",
    description: "Search books by title, author, or ISBN",
    action: <Button>Search</Button>
  }
}
