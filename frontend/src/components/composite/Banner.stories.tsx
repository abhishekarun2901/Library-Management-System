import type { Meta, StoryObj } from "@storybook/react"
import { Banner } from "./Banner"

const meta: Meta<typeof Banner> = {
  title: "Composite/Banner",
  component: Banner
}

export default meta

type Story = StoryObj<typeof Banner>

export const Info: Story = {
  args: {
    title: "Reservation Updated",
    description: "The reservation queue has been refreshed.",
    variant: "info"
  }
}

export const Success: Story = {
  args: {
    title: "Payment recorded for Alex Johnson.",
    variant: "success"
  }
}

export const Warning: Story = {
  args: {
    title: "You have $4.75 in outstanding fines.",
    description: "Please pay your fines to continue borrowing books without restrictions.",
    variant: "warning"
  }
}

export const Error: Story = {
  args: {
    title: "Return overdue — Clean Code",
    description: "This book is 19 days overdue. A fine of $4.75 has been applied.",
    variant: "error"
  }
}
