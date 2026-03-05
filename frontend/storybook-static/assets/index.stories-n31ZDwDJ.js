import{t as e}from"./jsx-runtime-Ds4jeNO1.js";import{t}from"./Input-Lmip952E.js";var n=e();const r=({children:e,errorText:t,helperText:r,htmlFor:i,label:a,required:o})=>(0,n.jsxs)(`div`,{className:`space-y-2`,children:[(0,n.jsxs)(`label`,{htmlFor:i,className:`text-sm font-medium text-gray-700`,children:[a,o?(0,n.jsx)(`span`,{className:`ml-1 text-red-600`,children:`*`}):null]}),e,t?(0,n.jsx)(`p`,{className:`text-sm text-red-600`,children:t}):null,!t&&r?(0,n.jsx)(`p`,{className:`text-sm text-gray-600`,children:r}):null]});r.__docgenInfo={description:``,methods:[],displayName:`FormField`,props:{label:{required:!0,tsType:{name:`string`},description:``},htmlFor:{required:!1,tsType:{name:`string`},description:``},helperText:{required:!1,tsType:{name:`string`},description:``},errorText:{required:!1,tsType:{name:`string`},description:``},required:{required:!1,tsType:{name:`boolean`},description:``},children:{required:!0,tsType:{name:`ReactNode`},description:``}}};var i={title:`Components/Forms/FormField`,component:r};const a={render:e=>(0,n.jsx)(r,{...e,children:(0,n.jsx)(t,{id:`book-title`,placeholder:`Enter book title`})}),args:{label:`Book Title`,htmlFor:`book-title`,helperText:`Use a clear and descriptive title.`}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: args => <FormField {...args}>
      <Input id="book-title" placeholder="Enter book title" />
    </FormField>,
  args: {
    label: "Book Title",
    htmlFor: "book-title",
    helperText: "Use a clear and descriptive title."
  }
}`,...a.parameters?.docs?.source}}};const o=[`Default`];export{a as Default,o as __namedExportsOrder,i as default};