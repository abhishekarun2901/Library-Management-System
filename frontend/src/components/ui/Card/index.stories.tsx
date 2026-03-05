import type { Meta, StoryObj } from "@storybook/react"
import { Card } from "./index"

const meta: Meta<typeof Card> = {
  title: "Components/UI/Card",
  component: Card
}

export default meta

type Story = StoryObj<typeof Card>

export const Default: Story = {
  render: () => (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900">Book Details</h3>
      <p className="mt-2 text-gray-600">Card container used for dashboard stats, forms, and tables.</p>
    </Card>
  )
}
