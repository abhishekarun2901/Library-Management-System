import type { Meta, StoryObj } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"
import { ReservationsPage } from "./ReservationsPage"

const meta: Meta<typeof ReservationsPage> = {
  title: "Pages/ReservationsPage",
  component: ReservationsPage,
  parameters: { layout: "fullscreen" },
}

export default meta
type Story = StoryObj<typeof ReservationsPage>

/** Librarian reservation queue — pending, ready, fulfilled, cancelled */
export const Librarian: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/librarian/reservations"]}>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: { role: "librarian" },
}

/** Member reservations — personal queue with cancel action */
export const Member: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/member/activity"]}>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: { role: "member" },
}
