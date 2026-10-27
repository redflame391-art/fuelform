(() => {
  const KEY = "fuelform.v1";
  const defaults = {
    profile:{name:"Athlete",age:22,sex:"Male",height:185,currentWeight:99,goalWeight:90},
    targets:{calories:3000,protein:190,carbs:375,fat:82,water:2500},
    logs:[], water:{}, weights:[{date:new Date().toISOString().slice(0,10),weight:99}],
    settings:{}
  };
  let state = load();
  const $ = id => document.getElementById(id);
  const today = () => new Date().toISOString().slice(0,10);
  const n = (v, fallback=0) => Number.isFinite(Number(v)) && v !== "" ? Number(v) : fallback;
  const fmt = v => Math.round(v).toLocaleString();
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function load(){try{const saved=JSON.parse(localStorage.getItem(KEY)||"null");return saved?{...structuredClone(defaults),...saved,profile:{...defaults.profile,...saved.profile},targets:{...defaults.targets,...saved.targets},logs:saved.logs||[],water:saved.water||{},weights:saved.weights||[]}:structuredClone(defaults)}catch{return structuredClone(defaults)}}
  function save(){localStorage.setItem(KEY,JSON.stringify(state));}
  function toast(msg){const el=$("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove("show"),2500)}
  function todayLogs(){return state.logs.filter(x=>x.date===today())}
  function totals(logs=todayLogs()){return logs.reduce((a,x)=>{for(const k of ["calories","protein","carbs","fat","fiber","sugar"])a[k]+=n(x[k]);return a},{calories:0,protein:0,carbs:0,fat:0,fiber:0,sugar:0})}
  const mealNames=["Breakfast","Morning snack","Lunch","Afternoon / pre-workout","Dinner / post-workout"];
  const mealIcons=["☼","◌","▤","↗","☾"];
  function pct(v,t){return Math.max(0,Math.min(100,t? v/t*100:0))}
  function render(){
    const logs=todayLogs(), t=totals(logs), target=state.targets, water=n(state.water[today()]);
    $("today-label").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"}).toUpperCase();
    $("date-chip").textContent=new Date().toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});
    $("calories-eaten").textContent=fmt(t.calories);$("calories-left").textContent=fmt(target.calories-t.calories);
    $("calorie-target-label").textContent=`Target ${fmt(target.calories)} kcal`;
    $("calorie-bar").style.width=pct(t.calories,target.calories)+"%";
    $("calorie-percent").textContent=`${Math.round(pct(t.calories,target.calories))}% of daily target`;
    const w=state.weights.slice().sort((a,b)=>b.date.localeCompare(a.date))[0]?.weight ?? state.profile.currentWeight;
    $("current-weight").textContent=Number(w).toFixed(1);$("goal-weight-label").textContent=`${state.profile.goalWeight} kg`;
    const start=99, goal=n(state.profile.goalWeight,90), progress=start===goal?100:pct(start-w,start-goal);
    $("weight-bar").style.width=progress+"%";$("weight-to-go").textContent=`${Math.max(0,w-goal).toFixed(1)} kg to go`;
    const macros=[{key:"protein",label:"Protein",color:"#A78BFA",target:target.protein},{key:"carbs",label:"Carbohydrates",color:"#60A5FA",target:target.carbs},{key:"fat",label:"Fat",color:"#34D399",target:target.fat}];
    $("macro-grid").innerHTML=macros.map(m=>`<article class="macro-card"><div class="macro-head"><span class="macro-dot" style="background:${m.color}"></span>${m.label}</div><div class="macro-number">${n(t[m.key]).toFixed(1).replace(/\.0$/,"")} <small>/ ${m.target} g</small></div><div class="progress-track"><span style="width:${pct(t[m.key],m.target)}%;background:${m.color}"></span></div><div class="macro-foot"><span>${Math.round(pct(t[m.key],m.target))}% of target</span><span>${Math.max(0,m.target-t[m.key]).toFixed(1)} g left</span></div></article>`).join("");
    $("meal-list").innerHTML=mealNames.map((m,i)=>{const items=logs.filter(x=>x.meal===m),sum=items.reduce((a,x)=>a+n(x.calories),0);return `<div class="meal-row"><div class="meal-icon">${mealIcons[i]}</div><div class="meal-info"><strong>${m}</strong><small>${items.length?items.length+" item"+(items.length===1?"":"s"):"No entries yet"}</small></div><div class="meal-kcal">${fmt(sum)}<small>kcal</small></div></div>`}).join("");
    $("water-total").textContent=fmt(water);$("water-target").textContent=fmt(target.water);$("water-bar").style.width=pct(water,target.water)+"%";
    $("food-count").textContent=`${logs.length} entr${logs.length===1?"y":"ies"}`;
    $("food-entries").innerHTML=logs.length?logs.slice().reverse().map(entryHTML).join(""):`<div class="empty-state">No food logged yet. Add your first entry to start today's totals.</div>`;
    $("history-stats").innerHTML=[["Days logged",new Set(state.logs.map(x=>x.date)).size],["Food entries",state.logs.length],["Latest weight",`${Number(w).toFixed(1)} kg`]].map(x=>`<div class="stat-card"><small>${x[0]}</small><strong>${x[1]}</strong><span>Personal tracking</span></div>`).join("");
    const byDate={};state.logs.forEach(x=>{byDate[x.date]??=[];byDate[x.date].push(x)});
    const dates=Object.keys(byDate).sort((a,b)=>b.localeCompare(a)).slice(0,14);
    $("history-list").innerHTML=dates.length?dates.map(d=>{const a=totals(byDate[d]);return `<div class="history-row"><div class="history-info"><strong>${new Date(d+"T12:00:00").toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}</strong><small>${byDate[d].length} food entries</small></div><div class="meal-kcal">${fmt(a.calories)}<small>kcal</small></div><div class="meal-kcal">${Math.round(a.protein)} g<small>protein</small></div></div>`}).join(""):`<div class="empty-state">Your daily history will appear here after you log food.</div>`;
    $("weight-records").innerHTML=state.weights.length?state.weights.slice().sort((a,b)=>b.date.localeCompare(a.date)).map((x,i)=>`<div class="entry-row"><div class="entry-info"><strong>${Number(x.weight).toFixed(1)} kg</strong><small>${esc(x.date)}</small></div><button class="mini-button danger" data-delete-weight="${esc(x.date)}">Delete</button></div>`).join(""):`<div class="empty-state">No weight records yet.</div>`;
    $("setting-name").value=state.profile.name;$("setting-weight").value=state.profile.currentWeight;$("setting-goal-weight").value=state.profile.goalWeight;$("setting-water").value=target.water;$("setting-calories").value=target.calories;$("setting-protein").value=target.protein;$("setting-carbs").value=target.carbs;$("setting-fat").value=target.fat;
  }
  function entryHTML(x){return `<div class="entry-row"><div class="entry-info"><strong>${esc(x.name)}</strong><small>${esc(x.meal)} · ${n(x.quantity,1)} × ${esc(x.unit||"serving")} · ${Math.round(n(x.calories))} kcal · P ${n(x.protein)} / C ${n(x.carbs)} / F ${n(x.fat)} g</small>${x.notes?`<small>${esc(x.notes)}</small>`:""}</div><div class="entry-actions"><button class="mini-button" data-duplicate="${esc(x.id)}">Copy</button><button class="mini-button danger" data-delete="${esc(x.id)}">Delete</button></div></div>`}
  function showPage(name){document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===`page-${name}`));document.querySelectorAll("[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===name));const titles={home:"Overview",food:"Log food",history:"History",weight:"Weight tracking",settings:"Settings"};$("page-title").textContent=titles[name]||"Overview";window.scrollTo({top:0,behavior:"smooth"});}
  document.addEventListener("click",e=>{
    const nav=e.target.closest("[data-page]");if(nav){showPage(nav.dataset.page);return}
    const go=e.target.closest("[data-go]");if(go){showPage(go.dataset.go);return}
    const water=e.target.closest("[data-water]");if(water){state.water[today()]=n(state.water[today()])+n(water.dataset.water);save();render();toast(`Added ${water.dataset.water} ml water`);return}
    const del=e.target.closest("[data-delete]");if(del){state.logs=state.logs.filter(x=>x.id!==del.dataset.delete);save();render();toast("Food entry removed");return}
    const dup=e.target.closest("[data-duplicate]");if(dup){const x=state.logs.find(x=>x.id===dup.dataset.duplicate);if(x){state.logs.push({...x,id:crypto.randomUUID(),date:today(),time:new Date().toISOString()});save();render();toast("Entry copied to today");}return}
    const dw=e.target.closest("[data-delete-weight]");if(dw){state.weights=state.weights.filter(x=>x.date!==dw.dataset.delete);save();render();toast("Weight record deleted");}
  });
  $("food-form").addEventListener("submit",e=>{
    e.preventDefault();const quantity=n($("food-qty").value,1);if(quantity<=0){toast("Quantity must be greater than zero");return}
    const raw={calories:n($("food-kcal").value),protein:n($("food-protein").value),carbs:n($("food-carbs").value),fat:n($("food-fat").value),fiber:$("food-fiber").value===""?null:n($("food-fiber").value),sugar:$("food-sugar").value===""?null:n($("food-sugar").value)};
    const entry={id:crypto.randomUUID(),date:today(),time:new Date().toISOString(),name:$("food-name").value.trim(),meal:$("food-meal").value,quantity,unit:$("food-unit").value.trim()||"serving",notes:$("food-notes").value.trim()};
    Object.entries(raw).forEach(([k,v])=>entry[k]=v===null?null:v*quantity);
    state.logs.push(entry);save();e.target.reset();$("food-qty").value="1";$("food-protein").value="0";$("food-carbs").value="0";$("food-fat").value="0";$("food-fiber").value="0";render();toast("Food added and daily totals updated");
  });
  $("clear-day").addEventListener("click",()=>{if(confirm("Delete all food entries logged today?")){state.logs=state.logs.filter(x=>x.date!==today());save();render();toast("Today's food log cleared")}});
  $("weight-form").addEventListener("submit",e=>{e.preventDefault();const date=$("weight-date").value,weight=n($("weight-value").value);state.weights=state.weights.filter(x=>x.date!==date);state.weights.push({date,weight});state.profile.currentWeight=weight;save();render();toast("Weight saved")});
  $("settings-form").addEventListener("submit",e=>{e.preventDefault();state.profile.name=$("setting-name").value.trim()||"Athlete";state.profile.currentWeight=n($("setting-weight").value,state.profile.currentWeight);state.profile.goalWeight=n($("setting-goal-weight").value,state.profile.goalWeight);state.targets.water=n($("setting-water").value,state.targets.water);state.targets.calories=n($("setting-calories").value,state.targets.calories);state.targets.protein=n($("setting-protein").value,state.targets.protein);state.targets.carbs=n($("setting-carbs").value,state.targets.carbs);state.targets.fat=n($("setting-fat").value,state.targets.fat);save();render();toast("Settings saved")});
  $("export-csv").addEventListener("click",()=>{const rows=[["Date","Time","Food","Meal","Quantity","Serving","Calories kcal","Protein g","Carbs g","Fat g","Fiber g","Sugar g","Notes"],...state.logs.map(x=>[x.date,x.time,x.name,x.meal,x.quantity,x.unit,x.calories,x.protein,x.carbs,x.fat,x.fiber??"",x.sugar??"",x.notes||""] )];const csv=rows.map(r=>r.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\r\n");const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));const a=document.createElement("a");a.href=url;a.download="fuelform-food-log.csv";a.click();URL.revokeObjectURL(url);});
  $("weight-date").value=today();$("weight-value").value=state.profile.currentWeight;render();
  if("serviceWorker" in navigator && location.protocol!=="file:"){navigator.serviceWorker.register("./service-worker.js").catch(()=>{});}
})();