import type { Meta, StoryObj } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"
import { QuickActionTile } from "./QuickActionTile"

const meta: Meta<typeof QuickActionTile> = {
  title: "Composite/QuickActionTile",
  component: QuickActionTile,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof QuickActionTile>

export const Default: Story = {
  args: {
    title: "Issue Book",
    description: "Start circulation workflow"
  }
}

export const WithLink: Story = {
  args: {
    title: "Browse Catalog",
    description: "Search and discover books",
    href: "/librarian/catalog"
  }
}
