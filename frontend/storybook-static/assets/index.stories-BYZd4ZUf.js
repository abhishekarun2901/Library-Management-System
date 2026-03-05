import{t as e}from"./jsx-runtime-Ds4jeNO1.js";import{t}from"./Button-E7tTOluY.js";import{t as n}from"./Input-Lmip952E.js";var r=e();const i=({children:e,className:t=``,description:n,title:i,...a})=>(0,r.jsxs)(`div`,{className:`mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${t}`.trim(),...a,children:[i?(0,r.jsx)(`h2`,{className:`text-xl font-semibold text-gray-900`,children:i}):null,n?(0,r.jsx)(`p`,{className:`mt-1 text-sm text-gray-600`,children:n}):null,(0,r.jsx)(`div`,{className:i||n?`mt-6 space-y-4`:`space-y-4`,children:e})]});i.__docgenInfo={description:``,methods:[],displayName:`FormCard`,props:{title:{required:!1,tsType:{name:`ReactNode`},description:``},description:{required:!1,tsType:{name:`ReactNode`},description:``},children:{required:!0,tsType:{name:`ReactNode`},description:``},className:{defaultValue:{value:`""`,computed:!1},required:!1}}};var a={title:`Components/Forms/FormCard`,component:i};const o={render:e=>(0,r.jsx)(`div`,{className:`bg-gray-100 p-6`,children:(0,r.jsxs)(i,{...e,children:[(0,r.jsx)(n,{placeholder:`Book title`}),(0,r.jsx)(n,{placeholder:`Author name`}),(0,r.jsxs)(`div`,{className:`flex gap-3`,children:[(0,r.jsx)(t,{children:`Save`}),(0,r.jsx)(t,{variant:`secondary`,children:`Cancel`})]})]})}),args:{title:`Book Management Form`,description:`Create or update book details`}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: args => <div className="bg-gray-100 p-6">
      <FormCard {...args}>
        <Input placeholder="Book title" />
        <Input placeholder="Author name" />
        <div className="flex gap-3">
          <Button>Save</Button>
          <Button variant="secondary">Cancel</Button>
        </div>
      </FormCard>
    </div>,
  args: {
    title: "Book Management Form",
    description: "Create or update book details"
  }
}`,...o.parameters?.docs?.source}}};const s=[`Default`];export{o as Default,s as __namedExportsOrder,a as default};