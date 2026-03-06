import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "../ui"
import { Modal } from "./Modal"

const meta: Meta<typeof Modal> = {
  title: "Overlay/Modal",
  component: Modal
}

export default meta

type Story = StoryObj<typeof Modal>

export const Default: Story = {
  args: {
    open: true,
    title: "Confirm Reservation",
    children: <p className="text-sm text-gray-600">Do you want to cancel this reservation?</p>,
    primaryAction: <Button variant="danger">Confirm</Button>
  }
}
