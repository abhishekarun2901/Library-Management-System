import type { Meta, StoryObj } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"
import { HomePage } from "./HomePage"

const meta: Meta<typeof HomePage> = {
  title: "Pages/HomePage",
  component: HomePage,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/"]}>
        <Story />
      </MemoryRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof HomePage>

/** Marketing landing page — sticky nav, gradient hero, feature highlights, CTA footer */
export const Default: Story = {}
