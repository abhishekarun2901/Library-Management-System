import type { Meta, StoryObj } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"
import { SignUpPage } from "./SignUpPage"

const meta: Meta<typeof SignUpPage> = {
  title: "Pages/SignUpPage",
  component: SignUpPage,
  decorators: [(Story) => <MemoryRouter initialEntries={["/signup"]}><Story /></MemoryRouter>],
  parameters: { layout: "fullscreen" }
}

export default meta

type Story = StoryObj<typeof SignUpPage>

export const Default: Story = {}
