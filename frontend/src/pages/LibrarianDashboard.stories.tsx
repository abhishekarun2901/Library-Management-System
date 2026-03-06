import type { Meta, StoryObj } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"
import { LibrarianDashboard } from "./LibrarianDashboard"
import { Default as SidebarStory } from "../components/navigation/Sidebar.stories"

const meta: Meta<typeof LibrarianDashboard> = {
  title: "Pages/LibrarianDashboard",
  component: LibrarianDashboard,
  decorators: [
    ...(SidebarStory.decorators ?? []),
    (Story) => <MemoryRouter initialEntries={["/librarian"]}><Story /></MemoryRouter>,
  ],
  parameters: { layout: "fullscreen" },
}

export default meta

type Story = StoryObj<typeof LibrarianDashboard>

/** Full librarian dashboard — desktop viewport */
export const Default: Story = {}

/** Librarian dashboard at tablet width (768 px) */
export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: "tablet" } },
}

/** Librarian dashboard at mobile width (375 px) */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
