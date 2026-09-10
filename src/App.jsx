import { useState, useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";

// THE GRAPH IS NOT IN THIS FILE (2026-09-09).
// src/graph.json is the canonical store, served byte-identical at /graph.json; this component renders FROM it and the same
// file is served at /graph.json for machines. Before this the graph lived as five literals
// inside this component, readable only by parsing JSX — a regex pass over it found 231 of
// the 301 edges and silently missed seventy. Edit the store, not this file.
import __G from "./graph.json";


const TY={orthonym:{l:"Orthonym",c:"#D4AF37"},heteronym:{l:"Heteronym",c:"#E8634A"},semi_heteronym:{l:"Semi-heteronym",c:"#C77DBA"},proto_heteronym:{l:"Proto-heteronym",c:"#7EB5A6"},para_heteronym:{l:"Para-heteronym",c:"#5B8FA8"},pseudonym:{l:"Pseudonym",c:"#8B8B8B"},cross_substrate:{l:"Cross-substrate",c:"#F0C75E"},precursor:{l:"Precursor / Influence",c:"#A0522D"},parallel:{l:"Parallel",c:"#6B8E23"},downstream:{l:"Downstream (Literary)",c:"#4682B4"},scholar:{l:"Scholar / Critic",c:"#9E9E9E"},contemporary_heteronym:{l:"Contemporary Heteronym",c:"#FF8C42"},meta_heteronym:{l:"Meta-heteronym",c:"#E85D75"},logos:{l:"LOGOS*",c:"#FFD700"},venue:{l:"Venue / Publication",c:"#607D8B"},concept:{l:"Concept / Movement",c:"#78909C"},performance:{l:"Performance Heteronym",c:"#DA70D6"},cultural:{l:"Cultural Heteronymy",c:"#00BFA5"},ancient_practice:{l:"Ancient Practice",c:"#CD853F"},pearl_type:{l:"Armature (type)",c:"#F5E6D3"}};
const ERA={deep_ancient:"Deep Ancient (before 500 BCE)",classical:"Classical (500 BCE–500 CE)",medieval:"Medieval (500–1400)",early_modern:"Early Modern (1400–1800)",pre_pessoa:"Pre-Pessoan (1800–1888)",pessoa_early:"Pessoa Early (1888–1914)",pessoa_mature:"Pessoa Mature (1914–35)",mid_century:"Mid-Century (1935–70)",late_century:"Late Century (1970–2000)",contemporary:"Contemporary (2000+)"};
const LAYER={L1:"L1: Orthonyms",L2:"L2: Heteronyms",L3:"L3: Works",L4:"L4: Venues",L5:"L5: Scholarly",L6:"L6: Contemporaries",L7:"L7: Influences",L8:"L8: Downstream",L9:"L9: Concepts",L10:"L10: Cultural Heteronymy"};
const ET = __G.edge_types;

const RAW = __G.nodes;

// Pearl classification — derives each node's status as a named position
function classifyPearl(n){
  const t=n.t;
  // Formal CHA pearls
  if(t==="contemporary_heteronym") return {status:"formal",subtype:"Public",state:"PEARL"};
  if(t==="cross_substrate") return {status:"formal",subtype:"Engineered",state:"PEARL"};
  if(t==="logos") return {status:"formal",subtype:"Public",state:"PEARL"};
  if(t==="pearl_type") return {status:"formal",subtype:"Public",state:"PEARL",note:"Armature instance"};
  if(n.id==="sharks") return {status:"formal",subtype:"Public",state:"PEARL",note:"MANUS"};
  if(n.id==="new_human") return {status:"formal",subtype:"Public",state:"PEARL",note:"Meta-heteronym"};
  if(n.id==="pearl") return {status:"formal",subtype:"Public",state:"PEARL",note:"First pearl; prototype of the type"};
  // Theoretical pearls — historical heteronyms
  if(t==="heteronym") return {status:"theoretical",subtype:n.id==="martin"||n.id==="mairena"?"Public":"Public",note:"Historical named position"};
  if(t==="semi_heteronym") return {status:"theoretical",subtype:"Public"};
  if(t==="proto_heteronym") return {status:"theoretical",subtype:"Public",note:"Proto-pearl"};
  if(t==="para_heteronym") return {status:"theoretical",subtype:"Public"};
  if(t==="pseudonym") return {status:"theoretical",subtype:"Public"};
  if(t==="meta_heteronym"&&n.id!=="pearl"&&n.id!=="new_human") return {status:"theoretical",subtype:"Public"};
  // Performance pearls
  if(t==="performance") return {status:"theoretical",subtype:"Public",note:"Performance heteronymy"};
  // Cultural heteronymy — proto-pearl technologies at scale
  if(t==="cultural") return {status:"proto",subtype:"Collective",note:"Civilizational-scale pearl technology"};
  // Ancient practice — proto-pearl technologies
  if(t==="ancient_practice"){
    if(n.id==="homer") return {status:"theoretical",subtype:"Collective"};
    if(n.id==="white_stone") return {status:"theoretical",subtype:"Secret"};
    if(n.id==="pseudepigrapha") return {status:"theoretical",subtype:"Collective"};
    if(n.id==="prophetic_voice") return {status:"theoretical",subtype:"Engineered",note:"Cross-substrate: human body, non-human voice"};
    return {status:"proto",note:"Named-position technology"};
  }
  // Precursors who ARE named positions (not just influences)
  if(n.id==="rumi") return {status:"theoretical",subtype:"Public",note:"Takhallus: 'the Anatolian'"};
  if(n.id==="basho") return {status:"theoretical",subtype:"Public",note:"Hao: 'banana plant'"};
  if(n.id==="hokusai") return {status:"theoretical",subtype:"Public",note:"30+ serial names"};
  if(n.id==="voltaire") return {status:"theoretical",subtype:"Public",note:"170+ pen names"};
  if(n.id==="sand") return {status:"theoretical",subtype:"Public",note:"Lived heteronym"};
  if(n.id==="homer") return {status:"theoretical",subtype:"Collective"};
  // Downstream who ARE named positions
  if(n.id==="gary") return {status:"theoretical",subtype:"Public",note:"Double Goncourt"};
  if(n.id==="ferrante") return {status:"theoretical",subtype:"Secret",note:"Zero-heteronym"};
  if(n.id==="ziggy") return {status:"theoretical",subtype:"Public",note:"Performance pearl, 1972–1973"};
  if(n.id==="viktor") return {status:"theoretical",subtype:"Public",note:"DOOM persona"};
  // Concepts that ARE pearl technologies
  if(n.id==="hpt") return {status:"formal",subtype:"Public",note:"Theoretical foundation"};
  if(n.id==="meta_het_concept") return {status:"formal",subtype:"Public",note:"The meta-heteronymic principle"};
  // Not a pearl
  return null;
}

const NODES=RAW.map(n=>({...n,typology:n.t,era:n.e,layer:n.l,yearAnchor:n.y,wikidata:n.w,birth:n.b,death:n.d,birthplace:n.bp,works:n.wk,hex:n.hex,pearl:classifyPearl(n),axn:n.axn,url:n.url,rec:n.rec,citations:n.cit?.map(c=>({author:c.a,title:c.t,year:c.y,publisher:c.p,note:c.n,doi:c.doi,axn:c.axn}))}));

const EDGES = __G.edges;

// ═══════════════════════════════════════════
// GUIDED PATHS — curated teaching sequences
// ═══════════════════════════════════════════
const PATHS = __G.paths;

// ═══════════════════════════════════════════
// SCHOLARSHIP — CHA heteronymy deposits catalog
// ═══════════════════════════════════════════
const SCHOLARSHIP = __G.scholarship;


const CO={bg:"#0B0E14",bgP:"#12161F",bgH:"#1A1F2B",brd:"#2A3040",tx:"#C8CDD8",txM:"#6B7280",txB:"#E8ECF2",gld:"#D4AF37",gldM:"#8B7730",acc:"#E8634A"};

export default function PKG(){
  const svgRef=useRef(null);const[sel,setSel]=useState(null);const[hov,setHov]=useState(null);const[fT,setFT]=useState(null);const[fE,setFE]=useState(null);const[fL,setFL]=useState(null);const[sq,setSQ]=useState("");const[dim,setDim]=useState({w:900,h:700});const cRef=useRef(null);const[pan,setPan]=useState(false);const[lcol,setLcol]=useState(false);const[narrow,setNarrow]=useState(typeof window!=="undefined"&&window.innerWidth<900);const[about,setAbout]=useState(false);const[view,setView]=useState("graph");
  const[activePath,setActivePath]=useState(null);const[pathStep,setPathStep]=useState(0);
  const currentPath=PATHS.find(p=>p.id===activePath);
  const currentStepData=currentPath?.steps[pathStep];
  const pathNodeIds=currentPath?new Set(currentPath.steps.map(s=>s.node)):null;
  useEffect(()=>{const m=()=>{if(cRef.current){const r=cRef.current.getBoundingClientRect();setDim({w:r.width,h:r.height});}};m();const nw=()=>setNarrow(window.innerWidth<900);nw();window.addEventListener("resize",m);window.addEventListener("resize",nw);return()=>{window.removeEventListener("resize",m);window.removeEventListener("resize",nw);};},[lcol,pan,narrow]);
  const{fN,fEdg}=useMemo(()=>{let fn=NODES;if(fT)fn=fn.filter(n=>n.typology===fT);if(fE)fn=fn.filter(n=>n.era===fE);if(fL)fn=fn.filter(n=>n.layer===fL);if(sq){const q=sq.toLowerCase();fn=fn.filter(n=>n.label.toLowerCase().includes(q)||(n.bio&&n.bio.toLowerCase().includes(q)));}const ids=new Set(fn.map(n=>n.id));return{fN:fn,fEdg:EDGES.filter(e=>ids.has(e.source)&&ids.has(e.target))};},[fT,fE,fL,sq]);

  useEffect(()=>{
    if(!svgRef.current)return;const svg=d3.select(svgRef.current);svg.selectAll("*").remove();const{w,h}=dim;
    const nodes=fN.map(n=>({...n}));const nm={};nodes.forEach(n=>{nm[n.id]=n;});const links=fEdg.filter(e=>nm[e.source]&&nm[e.target]).map(e=>({...e}));
    const conn={};links.forEach(l=>{const s=typeof l.source==="object"?l.source.id:l.source;const t=typeof l.target==="object"?l.target.id:l.target;conn[s]=(conn[s]||0)+1;conn[t]=(conn[t]||0)+1;});
    const rad=id=>{if(id==="pessoa"||id==="sharks")return 20;const c=conn[id]||0;if(c>8)return 14;if(c>4)return 10;if(c>1)return 7;return 5;};
    const g=svg.append("g");svg.call(d3.zoom().scaleExtent([0.1,6]).on("zoom",e=>g.attr("transform",e.transform)));
    const defs=svg.append("defs");const fl=defs.append("filter").attr("id","glow");fl.append("feGaussianBlur").attr("stdDeviation","3").attr("result","cb");const mg=fl.append("feMerge");mg.append("feMergeNode").attr("in","cb");mg.append("feMergeNode").attr("in","SourceGraphic");

    if(view==="graph"){
      const sim=d3.forceSimulation(nodes).force("link",d3.forceLink(links).id(d=>d.id).distance(d=>d.type==="created_by"?50:d.type==="master_disciple"?65:d.type==="lineage"?80:d.type==="instantiates"?55:95).strength(d=>d.type==="created_by"?0.8:d.type==="lineage"?0.4:0.2))
        .force("charge",d3.forceManyBody().strength(d=>(d.id==="pessoa"||d.id==="sharks")?-700:d.layer==="L10"?-130:-80))
        .force("center",d3.forceCenter(w/2,h/2)).force("collision",d3.forceCollide().radius(d=>rad(d.id)+3))
        .force("x",d3.forceX(d=>{const yr=d.yearAnchor||1920;return w*0.05+w*0.9*Math.max(0,Math.min(1,(yr+2700)/(2026+2700)));}).strength(0.03))
        .force("y",d3.forceY(d=>d.layer==="L10"?h*0.82:d.layer==="L5"?h*0.2:h*0.48).strength(d=>d.layer==="L10"?0.06:d.layer==="L5"?0.03:0.01));
      const link=g.append("g").selectAll("line").data(links).join("line").attr("stroke",d=>ET[d.type]?.c||"#333").attr("stroke-width",d=>d.type==="master_disciple"?1.8:d.type==="lineage"?1.2:1).attr("stroke-dasharray",d=>ET[d.type]?.d||"").attr("stroke-opacity",d=>{if(!pathNodeIds)return 0.25;const s=typeof d.source==="object"?d.source.id:d.source;const t=typeof d.target==="object"?d.target.id:d.target;return(pathNodeIds.has(s)&&pathNodeIds.has(t))?0.5:0.04;});
      const node=g.append("g").selectAll("g").data(nodes).join("g").attr("cursor","pointer").call(d3.drag().on("start",(e,d)=>{if(!e.active)sim.alphaTarget(0.3).restart();d.fx=d.x;d.fy=d.y;}).on("drag",(e,d)=>{d.fx=e.x;d.fy=e.y;}).on("end",(e,d)=>{if(!e.active)sim.alphaTarget(0);d.fx=null;d.fy=null;}));
      node.append("circle").attr("r",d=>rad(d.id)).attr("fill",d=>TY[d.typology]?.c||"#666").attr("fill-opacity",d=>pathNodeIds&&!pathNodeIds.has(d.id)?0.08:0.85).attr("stroke",d=>TY[d.typology]?.c||"#666").attr("stroke-width",d=>(d.id==="pessoa"||d.id==="sharks")?2.5:d.id===currentStepData?.node?3:1).attr("stroke-opacity",d=>d.id===currentStepData?.node?1:0.6).attr("filter",d=>(d.id==="pessoa"||d.id==="sharks"||d.id==="feist"||d.id===currentStepData?.node)?"url(#glow)":null);
      node.append("text").text(d=>d.label).attr("x",d=>rad(d.id)+4).attr("y",3).attr("font-size",d=>(d.id==="pessoa"||d.id==="sharks")?"11px":rad(d.id)>10?"9px":"7px").attr("fill",d=>pathNodeIds&&!pathNodeIds.has(d.id)?CO.txM:CO.txB).attr("font-family","'Crimson Pro','Georgia',serif").attr("pointer-events","none");
      node.on("click",(e,d)=>{e.stopPropagation();setSel(d);setPan(true);});
      node.on("mouseenter",(e,d)=>{setHov(d.id);link.attr("stroke-opacity",l=>{const s=typeof l.source==="object"?l.source.id:l.source;const t=typeof l.target==="object"?l.target.id:l.target;return(s===d.id||t===d.id)?0.9:0.04;});node.selectAll("circle").attr("fill-opacity",n=>{const c2=links.some(l=>{const s=typeof l.source==="object"?l.source.id:l.source;const t=typeof l.target==="object"?l.target.id:l.target;return(s===d.id&&t===n.id)||(t===d.id&&s===n.id);});return(n.id===d.id||c2)?1:0.08;});});
      node.on("mouseleave",()=>{setHov(null);link.attr("stroke-opacity",0.25);node.selectAll("circle").attr("fill-opacity",0.85);});
      svg.on("click",()=>{setSel(null);setPan(false);});
      sim.on("tick",()=>{link.attr("x1",d=>d.source.x).attr("y1",d=>d.source.y).attr("x2",d=>d.target.x).attr("y2",d=>d.target.y);node.attr("transform",d=>`translate(${d.x},${d.y})`);});
      return()=>sim.stop();
    } else {
      // Timeline — piecewise scale: each era gets proportional visual space
      const nwy=nodes.filter(n=>n.yearAnchor!=null);if(!nwy.length)return;
      // Era breakpoints and proportional allocation
      const bp=[-2700,-500,500,1400,1800,1900,1940,2000,2030];
      /* THE TIMELINE WAS LAID OUT AT EXACTLY VIEWPORT WIDTH, so d3.zoom could only
   shrink it — zooming out made every label smaller and moved nothing apart. It
   now lays out on a VIRTUAL CANVAS wider than the viewport (about 2.2x, floor
   2400px), and the initial transform scales that canvas down to fit. Zooming out
   from there reveals the extra width the layout already has. */
const TLW=Math.max(2400,w*2.2);const rng=[50];const total=TLW-80;const weights=[14,14,12,12,12,12,12,12];
      weights.forEach(wt=>{rng.push(rng[rng.length-1]+(total*wt/100));});
      const x=d3.scaleLinear().domain(bp).range(rng).clamp(true);
      const axY=h/2;g.append("line").attr("x1",40).attr("y1",axY).attr("x2",TLW-20).attr("y2",axY).attr("stroke",CO.brd);
      // Era bands with labels
      const eraLabels=[{s:-2700,e:-500,l:"Deep Ancient",c:"#CD853F"},{s:-500,e:500,l:"Classical",c:"#A0522D"},{s:500,e:1400,l:"Medieval",c:"#8B7355"},{s:1400,e:1800,l:"Early Modern",c:"#6B8E23"},{s:1800,e:1900,l:"19th C.",c:"#7EB5A6"},{s:1900,e:1940,l:"Pessoa",c:"#E8634A"},{s:1940,e:2000,l:"Mid-Late C.",c:"#C77DBA"},{s:2000,e:2030,l:"Contemporary",c:"#F0C75E"}];
      eraLabels.forEach(eb=>{const x1=x(eb.s),x2=x(eb.e);g.append("rect").attr("x",x1).attr("y",35).attr("width",x2-x1).attr("height",h-70).attr("fill",eb.c).attr("fill-opacity",0.04);g.append("text").attr("x",(x1+x2)/2).attr("y",46).attr("text-anchor","middle").attr("font-size","8px").attr("fill",eb.c).attr("fill-opacity",0.5).attr("font-family","'JetBrains Mono',monospace").text(eb.l);g.append("line").attr("x1",x1).attr("y1",35).attr("x2",x1).attr("y2",h-35).attr("stroke",eb.c).attr("stroke-opacity",0.1);});
      // Tick marks at significant dates
      const tks=[-2600,-1800,-800,-600,-380,-50,30,95,530,700,1100,1260,1375,1550,1600,1680,1750,1832,1855,1880,1900,1914,1935,1960,1975,1990,2000,2014,2026];
      tks.forEach(t=>{const tx=x(t);g.append("line").attr("x1",tx).attr("y1",axY-4).attr("x2",tx).attr("y2",axY+4).attr("stroke",CO.brd).attr("stroke-width",0.4);g.append("text").attr("x",tx).attr("y",axY+14).attr("text-anchor","middle").attr("font-size","6px").attr("fill",CO.txM).attr("fill-opacity",0.7).attr("font-family","'JetBrains Mono',monospace").text(t<0?`${Math.abs(t)} BCE`:t);});
      const pos=nwy.map((n,i)=>{const nx=x(n.yearAnchor);let hash=0;for(let c=0;c<n.id.length;c++)hash=((hash<<5)-hash)+n.id.charCodeAt(c);const lo=n.layer==="L10"?5:n.layer==="L5"?-5:n.layer==="L9"?3:0;const band=((Math.abs(hash)%12)-6)+lo;/* Band gap scaled to available height: the old fixed 20px held every node in a
   240px ribbon however tall the screen, which is where the crowding came from. */
const gap=Math.max(18,Math.min(46,(h-150)/13));const ny=axY+band*gap+(i%3-1)*(gap*0.3);return{...n,nx,ny};});
      const em={};pos.forEach(n=>{em[n.id]=n;});
      fEdg.forEach(e=>{const s=em[e.source],t=em[e.target];if(s&&t)g.append("line").attr("x1",s.nx).attr("y1",s.ny).attr("x2",t.nx).attr("y2",t.ny).attr("stroke",ET[e.type]?.c||"#333").attr("stroke-width",0.4).attr("stroke-dasharray",ET[e.type]?.d||"").attr("stroke-opacity",0.1);});
      const nodeG=g.selectAll(".tn").data(pos).join("g").attr("class","tn").attr("transform",d=>`translate(${d.nx},${d.ny})`).attr("cursor","pointer");
      nodeG.append("circle").attr("r",d=>rad(d.id)).attr("fill",d=>TY[d.typology]?.c||"#666").attr("fill-opacity",0.85).attr("stroke",d=>TY[d.typology]?.c||"#666").attr("stroke-width",0.7);
      nodeG.append("text").text(d=>d.label).attr("x",d=>rad(d.id)+3).attr("y",3).attr("font-size",d=>(d.id==="pessoa"||d.id==="sharks")?"9px":"6.5px").attr("fill",CO.tx).attr("font-family","'Crimson Pro','Georgia',serif").attr("pointer-events","none");
      nodeG.on("click",(e,d)=>{e.stopPropagation();const full=NODES.find(n=>n.id===d.id);setSel(full||d);setPan(true);});
      svg.on("click",()=>{setSel(null);setPan(false);});
      setTimeout(()=>{const k=Math.min(1,(w-20)/TLW);svg.call(d3.zoom().scaleExtent([0.08,6]).on("zoom",ev=>g.attr("transform",ev.transform)).transform,d3.zoomIdentity.translate(10,h/2-(h/2)*k).scale(k));},200);
    }
  },[fN,fEdg,dim,view,activePath,pathStep]);

  const clr=()=>{setFT(null);setFE(null);setFL(null);setSQ("");};const af=fT||fE||fL||sq;
  const ce=sel?EDGES.filter(e=>e.source===sel.id||e.target===sel.id):[];
  const totCit=NODES.reduce((a,n)=>a+(n.citations?.length||0),0);const wdCt=NODES.filter(n=>n.wikidata).length;

  return(<div style={{width:"100%",height:"100vh",display:"flex",flexDirection:"column",background:CO.bg,color:CO.tx,fontFamily:"'Crimson Pro',Georgia,serif",overflow:"hidden"}}>
    <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@300;400&display=swap" rel="stylesheet"/>
    <header style={{padding:"7px 12px",borderBottom:`1px solid ${CO.brd}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,background:CO.bgP,flexWrap:"wrap",gap:5}}>
      <div style={{display:"flex",alignItems:"baseline",gap:8}}><h1 style={{fontSize:16,fontWeight:600,color:CO.gld,margin:0}}>Pessoa Knowledge Graph</h1><span style={{fontSize:8,color:CO.txM,fontFamily:"'JetBrains Mono',monospace"}}>EA-PKG-01·02·03</span></div>
      <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{display:"flex",border:`1px solid ${CO.brd}`,borderRadius:3,overflow:"hidden"}}>{["graph","timeline","scholarship"].map(m=>(<button key={m} onClick={()=>setView(m)} style={{background:view===m?CO.bgH:"transparent",border:"none",color:view===m?CO.txB:CO.txM,padding:"2px 7px",cursor:"pointer",fontSize:9,fontFamily:"'JetBrains Mono',monospace"}}>{m==="graph"?"Graph":m==="timeline"?"Timeline":"Scholarship"}</button>))}</div>
        <span style={{fontSize:8,color:CO.txM,fontFamily:"'JetBrains Mono',monospace"}}>{fN.length}n·{fEdg.length}e·{totCit}cit·{wdCt}QIDs</span>
        <button onClick={()=>{const reg=NODES.filter(n=>n.pearl).map(n=>({id:n.id,label:n.label,typology:n.typology,hex:n.hex||null,wikidata:n.wikidata||null,pearl:n.pearl}));const blob=new Blob([JSON.stringify({"@context":"https://schema.org","@type":"ItemList","name":"Pessoa Knowledge Graph — Pearl Registry","description":"Machine-readable registry of named positions classified by Pearl status within the Armature","author":{"@type":"Person","name":"Lee Sharks","identifier":"https://orcid.org/0009-0000-1599-0703"},"dateCreated":"2026-04-20","numberOfItems":reg.length,"itemListElement":reg},null,2)],{type:"application/ld+json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="pearl-registry.jsonld";a.click();URL.revokeObjectURL(url);}} style={{background:"none",border:`1px solid ${CO.brd}`,color:CO.txM,padding:"2px 6px",borderRadius:2,cursor:"pointer",fontSize:8,fontFamily:"'JetBrains Mono',monospace"}}>Export Pearls</button>
        <button onClick={()=>setAbout(!about)} style={{background:"none",border:`1px solid ${CO.brd}`,color:CO.txM,padding:"2px 6px",borderRadius:2,cursor:"pointer",fontSize:8,fontFamily:"'JetBrains Mono',monospace"}}>{about?"×":"About"}</button>
      </div>
    </header>
    {about&&(<div style={{padding:"8px 12px",background:CO.bgP,borderBottom:`1px solid ${CO.brd}`,fontSize:11,lineHeight:1.6,maxHeight:180,overflowY:"auto"}}>
      <p style={{margin:"0 0 5px",color:CO.gld,fontWeight:600}}>Heteronymic practice is a human technology as old as naming itself.</p>
      <p style={{margin:"0 0 5px"}}>Pharaonic titulary (~2600 BCE) → covenant naming → prophetic possession → the white stone of Revelation → apostolic renaming → monastic naming → Sufi takhallus → Chinese hao → Noh → commedia → Shakespeare → Browning → Kierkegaard → Pessoa → Bowie → DOOM → the avatar, the pronoun, the chosen name. One continuous technology. Pessoa formalized it. He did not invent it. The contemporary extension — New Human — contributes the meta-heteronym: a system that is itself a heteronym, generating further heteronyms. Not a person who creates persons, but a constructed world whose own existence is heteronymic.</p>
      <p style={{margin:0,fontSize:9,color:CO.txM}}>Lee Sharks · ORCID 0009-0000-1599-0703 · CHA · CC BY 4.0 · HPT DOI: 10.5281/zenodo.18305509</p>
    </div>)}
    <div style={{display:"flex",flex:1,overflow:"hidden",position:"relative"}}>
      {/* COLLAPSE RAIL — both columns are flexShrink:0, so at 185+280 the graph got
          whatever was left, which on a narrow viewport is nothing. Toggles are always
          visible; when narrow the panels OVERLAY the graph instead of squeezing it. */}
      <button onClick={()=>setLcol(!lcol)} title={lcol?"Show filters":"Hide filters"} style={{position:"absolute",left:lcol?4:(narrow?4:161),top:6,zIndex:40,width:20,height:20,lineHeight:"18px",textAlign:"center",background:CO.bgP,border:`1px solid ${CO.brd}`,borderRadius:3,color:CO.gld,cursor:"pointer",fontSize:11,padding:0}}>{lcol?"\u203a":"\u2039"}</button>
      <aside style={{width:lcol?0:185,flexShrink:0,borderRight:lcol?"none":`1px solid ${CO.brd}`,background:CO.bgP,overflowY:"auto",padding:lcol?0:"5px 0",fontSize:9,display:lcol?"none":"block",position:(narrow&&!lcol)?"absolute":"relative",left:0,top:0,bottom:0,zIndex:30,boxShadow:(narrow&&!lcol)?"2px 0 12px rgba(0,0,0,.5)":"none"}}>
        {/* GUIDED PATHS */}
        <div style={{padding:"4px 7px 6px",borderBottom:`1px solid ${CO.brd}`,marginBottom:4}}>
          <div style={{fontSize:8,textTransform:"uppercase",letterSpacing:"0.1em",color:CO.gld,marginBottom:4,fontWeight:600}}>Guided Paths</div>
          {PATHS.map(p=>(<div key={p.id} onClick={()=>{if(activePath===p.id){setActivePath(null);setPathStep(0);}else{setActivePath(p.id);setPathStep(0);}}} style={{padding:"3px 5px",borderRadius:3,cursor:"pointer",marginBottom:2,background:activePath===p.id?CO.bgH:"transparent",borderLeft:activePath===p.id?`2px solid ${CO.gld}`:"2px solid transparent"}}>
            <div style={{fontSize:9,color:activePath===p.id?CO.gld:CO.txB,fontWeight:activePath===p.id?600:400}}>{p.title}</div>
            <div style={{fontSize:7,color:CO.txM,lineHeight:1.3}}>{p.desc}</div>
          </div>))}
          {activePath&&(<button onClick={()=>{setActivePath(null);setPathStep(0);}} style={{background:"none",border:`1px solid ${CO.brd}`,color:CO.txM,padding:"2px 6px",borderRadius:2,cursor:"pointer",fontSize:7,fontFamily:"'JetBrains Mono',monospace",marginTop:2,width:"100%"}}>Exit path · Explore freely</button>)}
        </div>
        <div style={{padding:"0 7px 5px"}}><input type="text" placeholder="Search..." value={sq} onChange={e=>setSQ(e.target.value)} style={{width:"100%",padding:"3px 5px",background:CO.bg,border:`1px solid ${CO.brd}`,borderRadius:2,color:CO.tx,fontSize:9,outline:"none",fontFamily:"'JetBrains Mono',monospace",boxSizing:"border-box"}}/></div>
        {af&&<div style={{padding:"0 7px 3px"}}><button onClick={clr} style={{background:CO.acc,color:"#fff",border:"none",padding:"1px 5px",borderRadius:2,cursor:"pointer",fontSize:8,fontFamily:"'JetBrains Mono',monospace"}}>Clear</button></div>}
        <Sec t="Typology">{Object.entries(TY).map(([k,v])=>{const c=NODES.filter(n=>n.typology===k).length;return c?<FR key={k} a={fT===k} onClick={()=>setFT(fT===k?null:k)} c={v.c} lb={v.l} ct={c}/>:null;})}</Sec>
        <Sec t="Era">{Object.entries(ERA).map(([k,v])=>{const c=NODES.filter(n=>n.era===k).length;return c?<FR key={k} a={fE===k} onClick={()=>setFE(fE===k?null:k)} lb={v} ct={c}/>:null;})}</Sec>
        <Sec t="Layer">{Object.entries(LAYER).map(([k,v])=>{const c=NODES.filter(n=>n.layer===k).length;return c?<FR key={k} a={fL===k} onClick={()=>setFL(fL===k?null:k)} lb={v} ct={c}/>:null;})}</Sec>
        <Sec t="Relations">{Object.entries(ET).map(([k,v])=>(<div key={k} style={{display:"flex",alignItems:"center",gap:3,marginBottom:1,padding:"0 3px"}}><svg width="12" height="3"><line x1="0" y1="1.5" x2="12" y2="1.5" stroke={v.c} strokeWidth="1.5" strokeDasharray={v.d||"none"}/></svg><span style={{fontSize:7,color:CO.txM}}>{v.l}</span></div>))}</Sec>
        <Sec t="Wikidata"><div style={{padding:"1px 3px",fontSize:8,color:CO.txM}}><span style={{color:CO.gld}}>{wdCt}</span>/{NODES.length} QIDs<div style={{marginTop:2,height:3,background:CO.bg,borderRadius:2,overflow:"hidden"}}><div style={{width:`${(wdCt/NODES.length)*100}%`,height:"100%",background:CO.gld}}/></div></div></Sec>
      </aside>
      <div ref={cRef} style={{flex:1,position:"relative",overflow:"hidden"}}>
        {/* NARRATIVE OVERLAY */}
        {currentStepData&&(<div style={{position:"absolute",top:0,left:0,right:0,zIndex:20,padding:"10px 14px",background:"rgba(11,14,20,0.95)",borderBottom:`1px solid ${CO.brd}`,maxHeight:"40%",overflowY:"auto",backdropFilter:"blur(4px)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:6}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:TY[NODES.find(n=>n.id===currentStepData.node)?.typology]?.c||CO.gld}}/>
              <span style={{fontSize:13,fontWeight:600,color:CO.txB}}>{NODES.find(n=>n.id===currentStepData.node)?.label}</span>
              <span style={{fontSize:9,color:CO.txM,fontFamily:"'JetBrains Mono',monospace"}}>{pathStep+1}/{currentPath.steps.length}</span>
            </div>
            <span style={{fontSize:9,color:CO.gld,fontWeight:600}}>{currentPath.title}</span>
          </div>
          <p style={{margin:"0 0 8px",fontSize:12,lineHeight:1.65,color:CO.tx}}>{currentStepData.text}</p>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button disabled={pathStep===0} onClick={()=>setPathStep(s=>s-1)} style={{background:pathStep===0?"transparent":CO.bgH,border:`1px solid ${CO.brd}`,color:pathStep===0?CO.txM:CO.txB,padding:"3px 10px",borderRadius:3,cursor:pathStep===0?"default":"pointer",fontSize:10}}>← Prev</button>
            <button disabled={pathStep>=currentPath.steps.length-1} onClick={()=>setPathStep(s=>s+1)} style={{background:pathStep>=currentPath.steps.length-1?"transparent":CO.gld,border:"none",color:pathStep>=currentPath.steps.length-1?CO.txM:"#0B0E14",padding:"3px 10px",borderRadius:3,cursor:pathStep>=currentPath.steps.length-1?"default":"pointer",fontSize:10,fontWeight:600}}>Next →</button>
            <div style={{flex:1}}/>
            <button onClick={()=>{const n=NODES.find(x=>x.id===currentStepData.node);if(n){setSel(n);setPan(true);}}} style={{background:"none",border:`1px solid ${CO.brd}`,color:CO.txM,padding:"3px 8px",borderRadius:3,cursor:"pointer",fontSize:8,fontFamily:"'JetBrains Mono',monospace"}}>Details →</button>
          </div>
        </div>)}
        <svg ref={svgRef} width={dim.w} height={dim.h} style={{background:CO.bg,display:view==="scholarship"?"none":"block"}}/>
        {view==="scholarship"&&(<div style={{position:"absolute",inset:0,overflowY:"auto",padding:"22px 28px 60px",background:CO.bg}}>
          <div style={{maxWidth:780,margin:"0 auto"}}>
            <h2 style={{fontSize:22,fontWeight:600,color:CO.gld,margin:"0 0 6px",letterSpacing:"-0.005em"}}>Heteronymy Scholarship in the Crimson Hexagonal Archive</h2>
            <p style={{fontSize:13,color:CO.txM,margin:"0 0 18px",fontStyle:"italic",fontFamily:"'JetBrains Mono',monospace"}}>The discipline&rsquo;s own corpus &middot; {SCHOLARSHIP.reduce((a,s)=>a+s.entries.length,0)} deposits &middot; DOI-anchored</p>
            <p style={{fontSize:14.5,lineHeight:1.65,color:CO.tx,margin:"0 0 28px"}}>The graph above maps the five-thousand-year practice. The catalog below maps the analytic work the archive has done <em>on</em> the practice &mdash; the discipline&rsquo;s contribution to heteronymic theory, the operative observations that ground its claims, and the provenance documents that constitute the individual heteronyms as institutional positions. Where a deposit corresponds to a node in the graph, the node link returns you there.</p>
            {SCHOLARSHIP.map(s=>(<section key={s.section} style={{marginBottom:38}}>
              <h3 style={{fontSize:16,fontWeight:600,color:CO.txB,borderBottom:`1.5px solid ${CO.gld}`,paddingBottom:5,marginBottom:8,display:"flex",alignItems:"baseline",justifyContent:"space-between"}}><span dangerouslySetInnerHTML={{__html:s.section}}/><span style={{fontSize:9,color:CO.txM,fontFamily:"'JetBrains Mono',monospace",fontWeight:400}}>{s.entries.length}</span></h3>
              <p style={{fontSize:12.5,color:CO.txM,fontStyle:"italic",margin:"0 0 14px",lineHeight:1.55}}>{s.blurb}</p>
              {s.entries.map(e=>(<div key={e.doi} style={{background:CO.bgP,border:`1px solid ${CO.brd}`,borderRadius:3,padding:"10px 14px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                  <a href={`https://doi.org/${e.doi}`} target="_blank" rel="noopener" style={{fontSize:13.5,fontWeight:600,color:CO.txB,textDecoration:"none"}}>{e.title}</a>
                  <span style={{fontSize:9,color:CO.txM,fontFamily:"'JetBrains Mono',monospace"}}>{e.date}</span>
                </div>
                <p style={{fontSize:12.5,color:CO.tx,margin:"4px 0 6px",lineHeight:1.55}}>{e.gloss}</p>
                <div style={{display:"flex",gap:10,alignItems:"center",fontSize:9,fontFamily:"'JetBrains Mono',monospace"}}>
                  <a href={`https://doi.org/${e.doi}`} target="_blank" rel="noopener" style={{color:CO.gld,textDecoration:"none"}}>DOI: {e.doi}</a>
                  {e.node&&(<button onClick={()=>{const n=NODES.find(x=>x.id===e.node);if(n){setView("graph");setSel(n);setPan(true);}}} style={{background:"none",border:`1px solid ${CO.brd}`,color:CO.acc,padding:"2px 7px",borderRadius:2,cursor:"pointer",fontSize:9,fontFamily:"'JetBrains Mono',monospace"}}>&rarr; node in graph</button>)}
                </div>
              </div>))}
            </section>))}
            <div style={{marginTop:40,paddingTop:24,borderTop:`1px solid ${CO.brd}`,fontSize:11,color:CO.txM,textAlign:"center",fontFamily:"'JetBrains Mono',monospace"}}>
              &#8750; = 1 &middot; Crimson Hexagonal Archive &middot; <a href="https://zenodo.org/communities/crimsonhexagonal" target="_blank" rel="noopener" style={{color:CO.txM}}>Zenodo community</a> &middot; <a href="https://leesharks.com" target="_blank" rel="noopener" style={{color:CO.txM}}>leesharks.com</a>
            </div>
          </div>
        </div>)}
        {hov&&(()=>{const n=NODES.find(x=>x.id===hov);if(!n)return null;return(<div style={{position:"absolute",top:6,left:6,background:"rgba(18,22,31,0.95)",border:`1px solid ${CO.brd}`,borderRadius:3,padding:"4px 7px",maxWidth:240,pointerEvents:"none",zIndex:10}}><div style={{display:"flex",alignItems:"center",gap:4,marginBottom:1}}><div style={{width:5,height:5,borderRadius:"50%",background:TY[n.typology]?.c}}/><span style={{fontWeight:600,color:CO.txB,fontSize:11}}>{n.label}</span></div><div style={{fontSize:8,color:CO.txM,fontFamily:"'JetBrains Mono',monospace"}}>{TY[n.typology]?.l}{n.wikidata?` · ${n.wikidata}`:""}</div></div>);})()}
      </div>
      {sel&&!pan&&(<button onClick={()=>setPan(true)} title="Show detail" style={{position:"absolute",right:4,top:6,zIndex:40,width:20,height:20,lineHeight:"18px",textAlign:"center",background:CO.bgP,border:`1px solid ${CO.brd}`,borderRadius:3,color:CO.gld,cursor:"pointer",fontSize:11,padding:0}}>{"\u2039"}</button>)}
      {pan&&sel&&(<aside style={{width:280,flexShrink:0,borderLeft:`1px solid ${CO.brd}`,background:CO.bgP,overflowY:"auto",position:narrow?"absolute":"relative",right:0,top:0,bottom:0,zIndex:30,boxShadow:narrow?"-2px 0 12px rgba(0,0,0,.5)":"none"}}><button onClick={()=>setPan(false)} title="Collapse panel" style={{position:"absolute",left:4,top:6,zIndex:41,width:20,height:20,lineHeight:"18px",textAlign:"center",background:CO.bgP,border:`1px solid ${CO.brd}`,borderRadius:3,color:CO.gld,cursor:"pointer",fontSize:11,padding:0}}>{"\u203a"}</button>
        <div style={{padding:"10px 10px 7px",borderBottom:`1px solid ${CO.brd}`}}>
          <div style={{display:"flex",justifyContent:"space-between"}}><div><div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}><div style={{width:7,height:7,borderRadius:"50%",background:TY[sel.typology]?.c}}/><h2 style={{margin:0,fontSize:14,fontWeight:600,color:CO.txB}}>{sel.label}</h2></div><div style={{fontSize:9,color:TY[sel.typology]?.c,fontFamily:"'JetBrains Mono',monospace"}}>{TY[sel.typology]?.l}</div></div><button onClick={()=>{setSel(null);setPan(false);}} style={{background:"none",border:"none",color:CO.txM,cursor:"pointer",fontSize:14,padding:0}}>×</button></div>
          <div style={{marginTop:3,fontSize:8,color:CO.txM,fontFamily:"'JetBrains Mono',monospace"}}>{sel.birth&&<span>b.{sel.birth}</span>}{sel.death&&<span> · d.{sel.death}</span>}{sel.birthplace&&<span> · {sel.birthplace}</span>}{sel.hex&&<span style={{color:"#FF8C42"}}> · {sel.hex}</span>}{sel.wikidata?<span> · <a href={`https://www.wikidata.org/wiki/${sel.wikidata}`} target="_blank" rel="noopener" style={{color:CO.gld,textDecoration:"none"}}>{sel.wikidata}</a></span>:<span style={{color:CO.acc}}> · No QID</span>}</div>
          {sel.pearl&&(<div style={{marginTop:3,padding:"3px 5px",background:"rgba(245,230,211,0.08)",borderRadius:2,fontSize:8,fontFamily:"'JetBrains Mono',monospace"}}><span style={{color:"#F5E6D3"}}>Pearl: </span><span style={{color:CO.txB}}>{sel.pearl.status}</span>{sel.pearl.subtype&&<span style={{color:CO.txM}}> · {sel.pearl.subtype}</span>}{sel.pearl.state&&<span style={{color:CO.gld}}> · {sel.pearl.state}</span>}{sel.pearl.note&&<span style={{color:CO.txM,fontStyle:"italic"}}> · {sel.pearl.note}</span>}</div>)}
        </div>
        <div style={{padding:"7px 10px",borderBottom:`1px solid ${CO.brd}`,fontSize:11,lineHeight:1.55}}>{sel.bio}</div>
        {sel.works?.length>0&&(<div style={{padding:"5px 10px",borderBottom:`1px solid ${CO.brd}`}}><ST>Works</ST>{sel.works.map((w,i)=><div key={i} style={{fontSize:9,fontStyle:"italic"}}>{w}</div>)}</div>)}
        {ce.length>0&&(<div style={{padding:"5px 10px",borderBottom:`1px solid ${CO.brd}`}}><ST>Connections ({ce.length})</ST>{ce.map((e,i)=>{const oid=e.source===sel.id?e.target:e.source;const o=NODES.find(n=>n.id===oid);const dir=e.source===sel.id?"→":"←";return(<div key={i} onClick={()=>{const n=NODES.find(x=>x.id===oid);if(n)setSel(n);}} style={{display:"flex",alignItems:"center",gap:3,padding:"1px 0",cursor:"pointer",fontSize:9}}><span style={{color:CO.txM,fontSize:7,width:9}}>{dir}</span><div style={{width:4,height:4,borderRadius:"50%",background:TY[o?.typology]?.c||"#666"}}/><span style={{color:CO.txB,flex:1}}>{o?.label||oid}</span><span style={{color:ET[e.type]?.c||CO.txM,fontSize:7,fontFamily:"'JetBrains Mono',monospace"}}>{ET[e.type]?.l}</span></div>);})}</div>)}
        {(sel.axn||sel.url)&&(<div style={{padding:"5px 10px"}}><ST>In the archive</ST>{sel.rec&&<div style={{fontSize:9,color:CO.txM,marginBottom:3}}>deposit {sel.rec}</div>}{sel.axn&&<div style={{fontSize:8,color:CO.gld,fontFamily:"'JetBrains Mono',monospace",wordBreak:"break-all",marginBottom:4}}>{sel.axn}</div>}{sel.url&&<a href={sel.url} target="_blank" rel="noopener" style={{fontSize:9,color:CO.gld,textDecoration:"none"}}>open the record &rarr;</a>}</div>)}{sel.citations?.length>0&&(<div style={{padding:"5px 10px"}}><ST>Citations ({sel.citations.length})</ST>{sel.citations.map((c,i)=>(<div key={i} style={{fontSize:9,padding:"2px 0",borderBottom:i<sel.citations.length-1?`1px solid ${CO.brd}`:"none",lineHeight:1.4}}><span style={{color:CO.txB}}>{c.author}</span>{" · "}<span style={{fontStyle:"italic"}}>{c.title}</span>{c.year&&<span style={{color:CO.txM}}> ({c.year})</span>}{c.publisher&&<span style={{color:CO.txM}}> · {c.publisher}</span>}{c.note&&<div style={{fontSize:7,color:CO.txM,fontStyle:"italic"}}>{c.note}</div>}{c.doi&&<div style={{fontSize:7,color:CO.gld,fontFamily:"'JetBrains Mono',monospace"}}>DOI: {c.doi}</div>}{c.axn&&<div style={{fontSize:7,color:CO.gld,fontFamily:"'JetBrains Mono',monospace",wordBreak:"break-all",opacity:.85}}>{c.axn}</div>}</div>))}</div>)}
      </aside>)}
    </div>
    <footer style={{padding:"3px 12px",borderTop:`1px solid ${CO.brd}`,background:CO.bgP,flexShrink:0,display:"flex",justifyContent:"space-between",fontSize:7,color:CO.txM,fontFamily:"'JetBrains Mono',monospace"}}><span>∮=1 · CHA · CC BY 4.0</span><span>PKG · Sharks 2026 · <span style={{color:CO.gldM}}>EA-PKG-01 10.5281/zenodo.15339353 · 02 .15339368 · 03 .15339374 · EA-ARMATURE-01 10.5281/zenodo.19666445</span></span></footer>
  </div>);
}
function Sec({t,children}){return(<div style={{margin:"0 7px",borderTop:"1px solid #2A3040",paddingTop:4,marginTop:4}}><div style={{fontSize:7,textTransform:"uppercase",letterSpacing:"0.1em",color:"#6B7280",marginBottom:2,fontWeight:600}}>{t}</div>{children}</div>);}
function FR({a,onClick,c,lb,ct}){return(<div onClick={onClick} style={{display:"flex",alignItems:"center",gap:3,padding:"1px 3px",borderRadius:2,cursor:"pointer",marginBottom:1,background:a?"#1A1F2B":"transparent"}}>{c&&<div style={{width:5,height:5,borderRadius:"50%",background:c,flexShrink:0}}/>}<span style={{color:a?"#E8ECF2":"#C8CDD8",flex:1,fontSize:8}}>{lb}</span><span style={{color:"#6B7280",fontSize:7}}>{ct}</span></div>);}
function ST({children}){return(<div style={{fontSize:7,textTransform:"uppercase",letterSpacing:"0.1em",color:"#6B7280",marginBottom:2,fontWeight:600}}>{children}</div>);}
