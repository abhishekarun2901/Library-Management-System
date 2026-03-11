import type { Meta, StoryObj } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"
import { MemberDashboard } from "./MemberDashboard"

const meta: Meta<typeof MemberDashboard> = {
  title: "Pages/MemberDashboard",
  component: MemberDashboard,
  decorators: [
    (Story) => <MemoryRouter initialEntries={["/member"]}><Story /></MemoryRouter>,
  ],
  parameters: { layout: "fullscreen" },
}

export default meta

type Story = StoryObj<typeof MemberDashboard>

/** Full member dashboard — desktop viewport with overdue banner visible */
export const Default: Story = {
  parameters: { viewport: { defaultViewport: "tablet" } },
}


