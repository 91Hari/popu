import{r as g,j as e,u as R}from"./index-CHaqTlx5.js";import{T as M,a as I,A as $,f as w,R as T,g as W}from"./TopNav-BNGIxDUk.js";import{g as z,a as N,u as U,c as O,d as D,s as E,m as F,y as S,z as A,A as L,D as B,e as X,q as y,r as s,T as p,t as b}from"./Logo-BsAuxat8.js";import{f as q}from"./foodService-C9AP763c.js";import{o as V}from"./orderService-OACEo4ci.js";import{C as G}from"./index-C-8e9Jmq.js";import{G as j}from"./Grid-36ACx4d3.js";import{C as H}from"./Card-Cuevru7v.js";import{C as K}from"./CardContent-4JqE6Dtg.js";import{S as k}from"./Stack-B74U9YbH.js";import"./Divider-CwyDiywR.js";import"./api-C0QzGLJu.js";import"./isMuiElement-De4v5wiQ.js";function P(t){return z("MuiSkeleton",t)}N("MuiSkeleton",["root","text","rectangular","rounded","circular","pulse","wave","withChildren","fitContent","heightAuto"]);const Q=t=>{const{classes:r,variant:o,animation:a,hasChildren:i,width:n,height:l}=t;return D({root:["root",o,a,i&&"withChildren",i&&!n&&"fitContent",i&&!l&&"heightAuto"]},P,r)},v=S`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
`,C=S`
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
`,_=typeof v!="string"?A`
        animation: ${v} 2s ease-in-out 0.5s infinite;
      `:null,J=typeof C!="string"?A`
        &::after {
          animation: ${C} 2s linear 0.5s infinite;
        }
      `:null,Y=E("span",{name:"MuiSkeleton",slot:"Root",overridesResolver:(t,r)=>{const{ownerState:o}=t;return[r.root,r[o.variant],o.animation!==!1&&r[o.animation],o.hasChildren&&r.withChildren,o.hasChildren&&!o.width&&r.fitContent,o.hasChildren&&!o.height&&r.heightAuto]}})(F(({theme:t})=>{const r=L(t.shape.borderRadius)||"px",o=B(t.shape.borderRadius);return{display:"block",backgroundColor:t.vars?t.vars.palette.Skeleton.bg:t.alpha(t.palette.text.primary,t.palette.mode==="light"?.11:.13),height:"1.2em",variants:[{props:{variant:"text"},style:{marginTop:0,marginBottom:0,height:"auto",transformOrigin:"0 55%",transform:"scale(1, 0.60)",borderRadius:`${o}${r}/${Math.round(o/.6*10)/10}${r}`,"&:empty:before":{content:'"\\00a0"'}}},{props:{variant:"circular"},style:{borderRadius:"50%"}},{props:{variant:"rounded"},style:{borderRadius:(t.vars||t).shape.borderRadius}},{props:({ownerState:a})=>a.hasChildren,style:{"& > *":{visibility:"hidden"}}},{props:({ownerState:a})=>a.hasChildren&&!a.width,style:{maxWidth:"fit-content"}},{props:({ownerState:a})=>a.hasChildren&&!a.height,style:{height:"auto"}},{props:{animation:"pulse"},style:_||{animation:`${v} 2s ease-in-out 0.5s infinite`}},{props:{animation:"wave"},style:{position:"relative",overflow:"hidden",WebkitMaskImage:"-webkit-radial-gradient(white, black)","&::after":{background:`linear-gradient(
                90deg,
                transparent,
                ${(t.vars||t).palette.action.hover},
                transparent
              )`,content:'""',position:"absolute",transform:"translateX(-100%)",bottom:0,left:0,right:0,top:0}}},{props:{animation:"wave"},style:J||{"&::after":{animation:`${C} 2s linear 0.5s infinite`}}}]}})),Z=g.forwardRef(function(r,o){const a=U({props:r,name:"MuiSkeleton"}),{animation:i="pulse",className:n,component:l="span",height:d,style:f,variant:m="text",width:u,...h}=a,x={...a,animation:i,component:l,variant:m,hasChildren:!!h.children},c=Q(x);return e.jsx(Y,{as:l,ref:o,className:O(c.root,n),ownerState:x,...h,style:{width:u,height:d,...f}})}),ee=X(e.jsx("path",{d:"M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.42 0 2.13.54 2.39 1.4.12.4.45.7.87.7h.3c.66 0 1.13-.65.9-1.27-.42-1.18-1.4-2.16-2.96-2.54V4.5c0-.83-.67-1.5-1.5-1.5S10 3.67 10 4.5v.66c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-1.65 0-2.5-.59-2.83-1.43-.15-.39-.49-.67-.9-.67h-.28c-.67 0-1.14.68-.89 1.3.57 1.39 1.9 2.21 3.4 2.53v.67c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-.65c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4"})),te=[{key:"foods",label:"Total Foods",icon:e.jsx(w,{sx:{color:s.orange,fontSize:36}})},{key:"orders",label:"Total Orders",icon:e.jsx(W,{sx:{color:s.orange,fontSize:36}})},{key:"revenue",label:"Revenue",prefix:"₹",icon:e.jsx(ee,{sx:{color:s.orange,fontSize:36}})}];function fe(){const[t,r]=g.useState({foods:0,orders:0,revenue:0}),[o,a]=g.useState(!0),i=R();return g.useEffect(()=>{(async()=>{try{a(!0);const l=await q.getFoods(),d=await V.getOrders(),f=Array.isArray(l)?l.length:0,m=Array.isArray(d)?d.length:0;let u=0;Array.isArray(d)&&d.forEach(h=>{(Array.isArray(h.items)?h.items:[]).forEach(c=>{u+=Number(c.quantity||c.qty||1)*Number(c.price||c.unitPrice||0)})}),r({foods:f,orders:m,revenue:u})}catch(l){console.error("Failed to fetch dashboard stats:",l),r({foods:0,orders:0,revenue:0})}finally{a(!1)}})()},[]),e.jsxs(y,{sx:{minHeight:"100vh",backgroundColor:s.bg},children:[e.jsx(M,{}),e.jsx(I,{}),e.jsxs(G,{maxWidth:"lg",sx:{pt:3,pb:4},children:[e.jsx(p,{variant:"h4",sx:{fontWeight:800,color:s.orange,mb:.5},children:"Caterer Dashboard"}),e.jsx(p,{variant:"body2",sx:{color:"text.secondary",mb:3},children:"Manage your food menu, track orders and revenue."}),e.jsx(j,{container:!0,spacing:2,sx:{mb:4},children:te.map(n=>e.jsx(j,{item:!0,xs:12,sm:4,children:e.jsx(H,{sx:{height:"100%",borderLeft:`4px solid ${s.orange}`,"&:hover":{boxShadow:"0 4px 16px rgba(232,117,26,0.12)"},transition:"box-shadow 0.2s"},children:e.jsx(K,{children:e.jsxs(k,{direction:"row",spacing:2,alignItems:"center",children:[e.jsx(y,{sx:{width:56,height:56,borderRadius:2.5,backgroundColor:s.orangeLight,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:n.icon}),e.jsxs(y,{children:[e.jsx(p,{variant:"body2",sx:{color:"text.secondary",fontWeight:500},children:n.label}),o?e.jsx(Z,{width:80,height:32}):e.jsxs(p,{variant:"h4",sx:{fontWeight:900,lineHeight:1.2},children:[n.prefix||"",t[n.key]]})]})]})})})},n.key))}),e.jsx(p,{variant:"h6",sx:{fontWeight:700,mb:2},children:"Quick Actions"}),e.jsxs(k,{direction:{xs:"column",sm:"row"},spacing:2,children:[e.jsx(b,{variant:"contained",size:"large",startIcon:e.jsx($,{}),sx:{background:`linear-gradient(135deg, ${s.orange} 0%, ${s.orangeMid} 100%)`,fontWeight:700,px:3},onClick:()=>i("/caterer/add-food"),children:"Add New Food"}),e.jsx(b,{variant:"outlined",size:"large",startIcon:e.jsx(w,{}),onClick:()=>i("/caterer/foods"),sx:{borderColor:s.orange,color:s.orange,fontWeight:700,px:3},children:"Manage Menu"}),e.jsx(b,{variant:"outlined",size:"large",startIcon:e.jsx(T,{}),onClick:()=>i("/caterer/orders"),sx:{borderColor:s.orange,color:s.orange,fontWeight:700,px:3},children:"View Orders"})]})]})]})}export{fe as default};
