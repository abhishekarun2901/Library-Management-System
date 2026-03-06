import type { Meta, StoryObj } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"
import { FinesPaymentsPage } from "./FinesPaymentsPage"

const meta: Meta<typeof FinesPaymentsPage> = {
  title: "Pages/FinesPaymentsPage",
  component: FinesPaymentsPage,
  parameters: { layout: "fullscreen" },
}

export default meta
type Story = StoryObj<typeof FinesPaymentsPage>

/** Librarian view — track overdue fines across all members, no actions column */
export const Librarian: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/librarian/fines"]}>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: { role: "librarian" },
}
