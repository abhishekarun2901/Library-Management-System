import type { Meta, StoryObj } from "@storybook/react"
import { Badge } from "../Badge"
import { Table } from "./index"

const meta: Meta<typeof Table> = {
  title: "Components/UI/Table",
  component: Table
}

export default meta

type Story = StoryObj<typeof Table>

export const Default: Story = {
  args: {
    headers: ["Book", "Member", "Status"],
    rows: [
      ["Atomic Habits", "Ava Smith", <Badge key="b1" label="Issued" variant="issued" />],
      ["Clean Code", "Noah Lee", <Badge key="b2" label="Reserved" variant="reserved" />],
      ["Deep Work", "Mia Jones", <Badge key="b3" label="Available" variant="available" />]
    ]
  }
}
