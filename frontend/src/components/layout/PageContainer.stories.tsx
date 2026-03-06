import type { Meta, StoryObj } from "@storybook/react"
import { Card, CardContent } from "../ui"
import { PageContainer } from "./PageContainer"

const meta: Meta<typeof PageContainer> = {
  title: "Layout/PageContainer",
  component: PageContainer
}

export default meta

type Story = StoryObj<typeof PageContainer>

export const Default: Story = {
  render: (args) => (
    <div className="bg-gray-100">
      <PageContainer {...args}>
        <Card>
          <CardContent>
            <p className="text-gray-600">Wrapped page content</p>
          </CardContent>
        </Card>
      </PageContainer>
    </div>
  )
}
