import{t as e}from"./jsx-runtime-Ds4jeNO1.js";import{t}from"./Button-E7tTOluY.js";import{t as n}from"./Input-Lmip952E.js";var r=e();const i=({action:e,children:t,className:n=``,description:i,title:a,...o})=>(0,r.jsxs)(`div`,{className:`rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${n}`.trim(),...o,children:[a||e?(0,r.jsxs)(`div`,{className:`flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between`,children:[(0,r.jsxs)(`div`,{children:[a?(0,r.jsx)(`h2`,{className:`text-lg font-semibold text-gray-900`,children:a}):null,i?(0,r.jsx)(`p`,{className:`mt-1 text-sm text-gray-600`,children:i}):null]}),e]}):null,(0,r.jsx)(`div`,{className:a||e?`mt-4 space-y-4`:`space-y-4`,children:t})]});i.__docgenInfo={description:``,methods:[],displayName:`SearchCard`,props:{title:{required:!1,tsType:{name:`ReactNode`},description:``},description:{required:!1,tsType:{name:`ReactNode`},description:``},action:{required:!1,tsType:{name:`ReactNode`},description:``},children:{required:!0,tsType:{name:`ReactNode`},description:``},className:{defaultValue:{value:`""`,computed:!1},required:!1}}};var a={title:`Components/Forms/SearchCard`,component:i};const o={render:e=>(0,r.jsx)(`div`,{className:`bg-gray-100 p-6`,children:(0,r.jsx)(i,{...e,children:(0,r.jsxs)(`div`,{className:`grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end`,children:[(0,r.jsx)(n,{placeholder:`Search catalog`}),(0,r.jsx)(t,{children:`Search`})]})})}),args:{title:`Catalog Search`,description:`Find books by title, author, or ISBN`}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: args => <div className="bg-gray-100 p-6">
      <SearchCard {...args}>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <Input placeholder="Search catalog" />
          <Button>Search</Button>
        </div>
      </SearchCard>
    </div>,
  args: {
    title: "Catalog Search",
    description: "Find books by title, author, or ISBN"
  }
}`,...o.parameters?.docs?.source}}};const s=[`Default`];export{o as Default,s as __namedExportsOrder,a as default};