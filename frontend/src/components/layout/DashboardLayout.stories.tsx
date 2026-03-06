import type { Meta, StoryObj } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"
import { Card, CardContent } from "../ui"
import { DashboardLayout } from "./DashboardLayout"

const meta: Meta<typeof DashboardLayout> = {
  title: "Layout/DashboardLayout",
  component: DashboardLayout,
  decorators: [(Story) => <MemoryRouter initialEntries={["/librarian"]}><Story /></MemoryRouter>],
  parameters: { layout: "fullscreen" }
}

export default meta

type Story = StoryObj<typeof DashboardLayout>

export const Default: Story = {
  args: {
    children: (
      <Card>
        <CardContent>
          <p className="text-gray-600">Dashboard page content</p>
        </CardContent>
      </Card>
    )
  }
}
