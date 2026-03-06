import type { Meta, StoryObj } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"
import { MyActivityPage } from "./MyActivityPage"

const meta: Meta<typeof MyActivityPage> = {
  title: "Pages/MyActivityPage",
  component: MyActivityPage,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/member/activity"]}>
        <Story />
      </MemoryRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof MyActivityPage>

/**
 * Member activity hub — 5 tabs: My Loans, Reservations, History, Fines,
 * and My Profile. Stats row at top. Starts on Loans tab.
 */
export const Default: Story = {}
