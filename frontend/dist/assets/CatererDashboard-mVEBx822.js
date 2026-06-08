import{r as m,d as I,j as e,e as M,m as w,o as R,p as $,t as T,u as W,b as s}from"./index-B9pAAvSG.js";import{T as F,a as N,A as O,g as A,R as U,i as z}from"./TopNav-_POovKo_.js";import{g as B,b as D,e as L,s as E,m as X,c as V,B as v,T as h,a as y}from"./Logo-D1ZmGyGF.js";import{f as _}from"./foodService-GluUoi-m.js";import{o as G}from"./orderService-Cjim7tOg.js";import{C as H}from"./index-BC-aIWsJ.js";import{G as k}from"./Grid-CBCIrldL.js";import{C as K}from"./Card-BSQ9rJmQ.js";import{C as P}from"./CardContent-B62La0FY.js";import{S}from"./Stack-NXLGpQpq.js";import"./isMuiElement-DLOfo9po.js";function J(t){return B("MuiSkeleton",t)}D("MuiSkeleton",["root","text","rectangular","rounded","circular","pulse","wave","withChildren","fitContent","heightAuto"]);const Q=t=>{const{classes:r,variant:o,animation:a,hasChildren:i,width:n,height:l}=t;return L({root:["root",o,a,i&&"withChildren",i&&!n&&"fitContent",i&&!l&&"heightAuto"]},J,r)},C=w`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
`,j=w`
  0% {
    transform: translateX(-100%);
  }

  50% {
    /* +0.5s of delay between each loop */
    transform: translateX(100%);
  }

  100% {
    transform: translateX(100%);
  }
`,q=typeof C!="string"?R`
        animation: ${C} 2s ease-in-out 0.5s infinite;
      `:null,Y=typeof j!="string"?R`
        &::after {
          animation: ${j} 2s linear 0.5s infinite;
        }
      `:null,Z=E("span",{name:"MuiSkeleton",slot:"Root",overridesResolver:(t,r)=>{const{ownerState:o}=t;return[r.root,r[o.variant],o.animation!==!1&&r[o.animation],o.hasChildren&&r.withChildren,o.hasChildren&&!o.width&&r.fitContent,o.hasChildren&&!o.height&&r.heightAuto]}})(X(({theme:t})=>{const r=$(t.shape.borderRadius)||"px",o=T(t.shape.borderRadius);return{display:"block",backgroundColor:t.vars?t.vars.palette.Skeleton.bg:t.alpha(t.palette.text.primary,t.palette.mode==="light"?.11:.13),height:"1.2em",variants:[{props:{variant:"text"},style:{marginTop:0,marginBottom:0,height:"auto",transformOrigin:"0 55%",transform:"scale(1, 0.60)",borderRadius:`${o}${r}/${Math.round(o/.6*10)/10}${r}`,"&:empty:before":{content:'"\\00a0"'}}},{props:{variant:"circular"},style:{borderRadius:"50%"}},{props:{variant:"rounded"},style:{borderRadius:(t.vars||t).shape.borderRadius}},{props:({ownerState:a})=>a.hasChildren,style:{"& > *":{visibility:"hidden"}}},{props:({ownerState:a})=>a.hasChildren&&!a.width,style:{maxWidth:"fit-content"}},{props:({ownerState:a})=>a.hasChildren&&!a.height,style:{height:"auto"}},{props:{animation:"pulse"},style:q||{animation:`${C} 2s ease-in-out 0.5s infinite`}},{props:{animation:"wave"},style:{position:"relative",overflow:"hidden",WebkitMaskImage:"-webkit-radial-gradient(white, black)","&::after":{background:`linear-gradient(
                90deg,
                transparent,
                ${(t.vars||t).palette.action.hover},
                transparent
              )`,content:'""',position:"absolute",transform:"translateX(-100%)",bottom:0,left:0,right:0,top:0}}},{props:{animation:"wave"},style:Y||{"&::after":{animation:`${j} 2s linear 0.5s infinite`}}}]}})),ee=m.forwardRef(function(r,o){const a=I({props:r,name:"MuiSkeleton"}),{animation:i="pulse",className:n,component:l="span",height:d,style:c,variant:x="text",width:p,...u}=a,g={...a,animation:i,component:l,variant:x,hasChildren:!!u.children},f=Q(g);return e.jsx(Z,{as:l,ref:o,className:M(f.root,n),ownerState:g,...u,style:{width:p,height:d,...c}})}),te=V(e.jsx("path",{d:"M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.42 0 2.13.54 2.39 1.4.12.4.45.7.87.7h.3c.66 0 1.13-.65.9-1.27-.42-1.18-1.4-2.16-2.96-2.54V4.5c0-.83-.67-1.5-1.5-1.5S10 3.67 10 4.5v.66c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-1.65 0-2.5-.59-2.83-1.43-.15-.39-.49-.67-.9-.67h-.28c-.67 0-1.14.68-.89 1.3.57 1.39 1.9 2.21 3.4 2.53v.67c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-.65c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4"})),oe=[{key:"foods",label:"Total Foods",icon:e.jsx(A,{sx:{color:s.orange,fontSize:36}})},{key:"orders",label:"Total Orders",icon:e.jsx(z,{sx:{color:s.orange,fontSize:36}})},{key:"revenue",label:"Revenue",prefix:"₹",icon:e.jsx(te,{sx:{color:s.orange,fontSize:36}})}];function ge(){const[t,r]=m.useState({foods:0,orders:0,revenue:0}),[o,a]=m.useState(!0),i=W();return m.useEffect(()=>{(async()=>{try{a(!0);const l=JSON.parse(localStorage.getItem("user")||"{}"),[d,c]=await Promise.all([_.getFoods(),G.getOrders()]),x=(Array.isArray(d)?d:[]).filter(b=>b.caterer_id===l.id),p=Array.isArray(c)?c:c?.orders??[],u=x.length,g=p.length;let f=0;p.forEach(b=>{f+=Number(b.total_amount||0)}),r({foods:u,orders:g,revenue:f})}catch(l){console.error("Failed to fetch dashboard stats:",l),r({foods:0,orders:0,revenue:0})}finally{a(!1)}})()},[]),e.jsxs(v,{sx:{minHeight:"100vh",backgroundColor:s.bg},children:[e.jsx(F,{}),e.jsx(N,{}),e.jsxs(H,{maxWidth:"lg",sx:{pt:3,pb:4},children:[e.jsx(h,{variant:"h4",sx:{fontWeight:800,color:s.orange,mb:.5},children:"Caterer Dashboard"}),e.jsx(h,{variant:"body2",sx:{color:"text.secondary",mb:3},children:"Manage your food menu, track orders and revenue."}),e.jsx(k,{container:!0,spacing:2,sx:{mb:4},children:oe.map(n=>e.jsx(k,{item:!0,xs:12,sm:4,children:e.jsx(K,{sx:{height:"100%",borderLeft:`4px solid ${s.orange}`,"&:hover":{boxShadow:"0 4px 16px rgba(232,117,26,0.12)"},transition:"box-shadow 0.2s"},children:e.jsx(P,{children:e.jsxs(S,{direction:"row",spacing:2,alignItems:"center",children:[e.jsx(v,{sx:{width:56,height:56,borderRadius:2.5,backgroundColor:s.orangeLight,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:n.icon}),e.jsxs(v,{children:[e.jsx(h,{variant:"body2",sx:{color:"text.secondary",fontWeight:500},children:n.label}),o?e.jsx(ee,{width:80,height:32}):e.jsxs(h,{variant:"h4",sx:{fontWeight:900,lineHeight:1.2},children:[n.prefix||"",t[n.key]]})]})]})})})},n.key))}),e.jsx(h,{variant:"h6",sx:{fontWeight:700,mb:2},children:"Quick Actions"}),e.jsxs(S,{direction:{xs:"column",sm:"row"},spacing:2,children:[e.jsx(y,{variant:"contained",size:"large",startIcon:e.jsx(O,{}),sx:{background:`linear-gradient(135deg, ${s.orange} 0%, ${s.orangeMid} 100%)`,fontWeight:700,px:3},onClick:()=>i("/caterer/add-food"),children:"Add New Food"}),e.jsx(y,{variant:"outlined",size:"large",startIcon:e.jsx(A,{}),onClick:()=>i("/caterer/foods"),sx:{borderColor:s.orange,color:s.orange,fontWeight:700,px:3},children:"Manage Menu"}),e.jsx(y,{variant:"outlined",size:"large",startIcon:e.jsx(U,{}),onClick:()=>i("/caterer/orders"),sx:{borderColor:s.orange,color:s.orange,fontWeight:700,px:3},children:"View Orders"})]})]})]})}export{ge as default};
