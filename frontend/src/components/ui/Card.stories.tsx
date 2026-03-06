import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "./Button"
import { Card, CardContent, CardFooter, CardHeader } from "./Card"

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card
}

export default meta

type Story = StoryObj<typeof Card>

export const Default: Story = {
  render: () => (
    <Card className="max-w-lg">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Book Details</h3>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Card container used for dashboard stats, forms, and tables.</p>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="primary">Save</Button>
      </CardFooter>
    </Card>
  )
}
