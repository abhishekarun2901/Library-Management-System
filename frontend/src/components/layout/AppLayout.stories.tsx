import type { Meta, StoryObj } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"
import { Card, CardContent } from "../ui"
import { AppLayout } from "./AppLayout"
import { librarianSidebarItems } from "../../config/sidebarConfig"

const meta: Meta<typeof AppLayout> = {
  title: "Layout/AppLayout",
  component: AppLayout,
  decorators: [(Story) => <MemoryRouter initialEntries={["/librarian"]}><Story /></MemoryRouter>],
  parameters: { layout: "fullscreen" }
}

export default meta

type Story = StoryObj<typeof AppLayout>

/** Full app shell — indigo/purple gradient topbar + sidebar, main content area */
export const Default: Story = {
  args: {
    topbarTitle: "Librarian Dashboard",
    sidebarItems: librarianSidebarItems,
    children: (
      <div className="p-6">
        <Card>
          <CardContent>
            <p className="text-gray-600">Main content area</p>
          </CardContent>
        </Card>
      </div>
    )
  }
}
