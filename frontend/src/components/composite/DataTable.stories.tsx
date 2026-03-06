import type { Meta, StoryObj } from "@storybook/react"
import { Badge } from "../ui"
import { DataTable } from "./DataTable"

const meta: Meta<typeof DataTable> = {
  title: "Composite/DataTable",
  component: DataTable
}

export default meta

type Story = StoryObj<typeof DataTable>

export const Default: Story = {
  args: {
    title: "Reservation Queue",
    headers: ["Book", "Member", "Status"],
    rows: [
      ["Atomic Habits", "Ava Smith", <Badge key="b1" label="Issued" variant="issued" />],
      ["Clean Code", "Noah Lee", <Badge key="b2" label="Reserved" variant="reserved" />],
      ["Deep Work", "Mia Jones", <Badge key="b3" label="Available" variant="available" />]
    ]
  }
}
