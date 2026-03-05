import{t as e}from"./jsx-runtime-Ds4jeNO1.js";var t=e();const n=({className:e=``,options:n,placeholder:r,...i})=>(0,t.jsxs)(`select`,{className:`w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${e}`.trim(),...i,children:[r?(0,t.jsx)(`option`,{value:``,disabled:!0,children:r}):null,n.map(e=>(0,t.jsx)(`option`,{value:e.value,children:e.label},e.value))]});n.__docgenInfo={description:``,methods:[],displayName:`Select`,props:{options:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{
  label: string
  value: string
}`,signature:{properties:[{key:`label`,value:{name:`string`,required:!0}},{key:`value`,value:{name:`string`,required:!0}}]}}],raw:`SelectOption[]`},description:``},placeholder:{required:!1,tsType:{name:`string`},description:``},className:{defaultValue:{value:`""`,computed:!1},required:!1}}};var r={title:`Components/UI/Select`,component:n};const i={args:{placeholder:`Select category`,defaultValue:``,options:[{label:`Fiction`,value:`fiction`},{label:`Science`,value:`science`},{label:`History`,value:`history`}]}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Select category",
    defaultValue: "",
    options: [{
      label: "Fiction",
      value: "fiction"
    }, {
      label: "Science",
      value: "science"
    }, {
      label: "History",
      value: "history"
    }]
  }
}`,...i.parameters?.docs?.source}}};const a=[`Default`];export{i as Default,a as __namedExportsOrder,r as default};