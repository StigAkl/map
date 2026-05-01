import{a as e,d as t,i as n,l as r,o as i,s as a,t as o}from"./index-Ci1gMAxu.js";var s=t(i(),1),c=n(function({data:t,...n},r){let i=new s.GeoJSON(t,n);return e(i,a(r,{overlayContainer:i}))},function(e,t,n){t.style!==n.style&&(t.style==null?e.resetStyle():e.setStyle(t.style))}),l=t(r(),1),u=o(),d=`/map/data/geojson/submarine_cables.json`,f=()=>{let[e,t]=(0,l.useState)(null);return(0,l.useEffect)(()=>{let e=!1;return fetch(d).then(e=>e.json()).then(n=>{e||t(n)}),()=>{e=!0}},[]),e?(0,u.jsx)(c,{data:e,onEachFeature:(e,t)=>{let n=e.properties?.name??`Ukjent kabel`,r=e.properties?.length??`Ukjent lengde`,i=e.properties?.owners??`Ukjent`;t.bindPopup(`
            <div class="flex flex-col gap-2">
              <strong>${n}</strong>
              <span>Lengde: ${r}</span>
              <span>Eiere: ${i}</span>
            </div>
          `)},style:e=>({color:e?.properties?.color??`#00ff00`,opacity:1,weight:.7})}):null};export{f as default};