let cleanup: (() => void) | undefined;

function setup() {
  cleanup?.();
  const controller = new AbortController();
  const { signal } = controller;
  const on = (element: EventTarget | null, type: string, handler: EventListener) => element?.addEventListener(type, handler, {signal});
  cleanup = () => controller.abort();
  const menu = document.querySelector<HTMLButtonElement>('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  const closeMenu = () => { menu?.setAttribute('aria-expanded','false'); menu?.setAttribute('aria-label','打开导航'); nav?.classList.remove('is-open'); };
  on(menu, 'click', () => { const open = menu?.getAttribute('aria-expanded') !== 'true'; menu?.setAttribute('aria-expanded',String(open)); menu?.setAttribute('aria-label',open ? '关闭导航' : '打开导航'); nav?.classList.toggle('is-open',open); });
  nav?.querySelectorAll('a').forEach(a => on(a,'click',closeMenu));
  on(document,'keydown', e => { if ((e as KeyboardEvent).key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
  const motion = document.querySelector<HTMLButtonElement>('.motion-toggle');
  let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { paused = localStorage.getItem('4art-motion') === 'paused' || paused; } catch { /* Storage may be unavailable. */ }
  const setMotion = () => { document.documentElement.classList.toggle('no-motion',paused); motion?.setAttribute('aria-pressed',String(paused)); if (motion) motion.textContent = paused ? '动态效果已暂停' : '暂停动态效果'; };
  setMotion();
  on(motion,'click',() => { paused = !paused; setMotion(); try {localStorage.setItem('4art-motion',paused?'paused':'on');} catch { /* Preference remains usable for this page. */ } });
  document.querySelectorAll<HTMLElement>('[data-tabs]').forEach(group => {
    const tabs = Array.from(group.querySelectorAll<HTMLButtonElement>('[role=tab]'));
    const select = (tab: HTMLButtonElement) => { tabs.forEach(item => {const active = item === tab; item.setAttribute('aria-selected',String(active)); item.tabIndex = active ? 0 : -1;}); group.querySelectorAll<HTMLElement>('[data-panel]').forEach(panel => panel.hidden = panel.dataset.panel !== tab.dataset.tab); };
    tabs.forEach((tab,i) => { on(tab,'click',() => select(tab)); on(tab,'keydown', e => {const key=(e as KeyboardEvent).key; let next=i; if(key==='ArrowRight') next=(i+1)%tabs.length; else if(key==='ArrowLeft') next=(i-1+tabs.length)%tabs.length; else if(key==='Home') next=0; else if(key==='End') next=tabs.length-1; else return; e.preventDefault(); select(tabs[next]);tabs[next].focus();}); });
  });
  const evidenceData: Record<string,{title:string;description:string;items:string[]}> = {
    authenticity:{title:'确真：谁来判断，依据是什么？',description:'将作品本体信息、观察记录与专家意见分开留存，明确判断主体和适用范围。',items:['作品图像、尺寸、材质与观察条件','检测或专家意见的来源、时间和范围','存在分歧或尚缺的证据']},
    rights:{title:'确权：拥有什么，可以做什么？',description:'持有实物、拥有著作权与获准传播并非同一件事。逐项记录权利主体和许可范围。',items:['实物持有与转移凭证','展示、复制、改编等具体许可','AI 处理与训练授权分别记录']},
    provenance:{title:'确源：让每段来历都能回看。',description:'将创作、展览、收藏与流转事件连接到原始材料；缺失的环节保留为空白。',items:['创作记录、时间与材料来源','展览及流转事件的原始凭证','记录人、更新时间与修订历史']},
    value:{title:'确价：呈现依据，也呈现局限。',description:'记录比较样本、方法、时间和不确定性，结合专业判断形成有边界的价值分析。',items:['可比较样本及其成交状态','差异因素与分析方法','价值区间、局限和复核意见']}
  };
  document.querySelectorAll<HTMLButtonElement>('[data-evidence]').forEach(btn => on(btn,'click',() => {document.querySelectorAll('[data-evidence]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));const item=evidenceData[btn.dataset.evidence!];const title=document.querySelector('[data-evidence-title]');const description=document.querySelector('[data-evidence-description]');const list=document.querySelector('[data-evidence-list]');if(title) title.textContent=item.title;if(description) description.textContent=item.description;if(list) list.replaceChildren(...item.items.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));}));
  const form=document.querySelector<HTMLFormElement>('#brief-form');
  let exportText='';
  on(form,'submit',event=>{
    event.preventDefault(); if (!form?.reportValidity()) return;
    const data=new FormData(form);const title=String(data.get('work')||'').trim();const story=String(data.get('story')||'').trim();const medium=String(data.get('medium')||'');const output=String(data.get('output')||'');
    if(!title || !story){ const status=document.querySelector<HTMLElement>('#brief-status');if(status) status.textContent='请填写作品名称与创作素材，空白字符不能作为内容。';return; }
    const plans:Record<string,string>={
      article:'1. 开场：用一个具体细节介绍这件作品。\n2. 作品故事：围绕提供的材料，讲述创作缘起。\n3. 工艺细节：补充一个真实的制作过程与难点。\n4. 配图：作品整体、局部、制作现场各一张。\n5. 收尾：以创作者自己的感受结束，不虚构经历。',
      design:'1. 确认用途：展览海报、包装或作品介绍。\n2. 视觉方向：从作品中提取两种主色和一个形态。\n3. 准备素材：作品原图、名称及获准公开的署名。\n4. 探索方案：克制留白、材料细节、形态延展三种方向。\n5. 复核：确认图像没有误改作品结构，标记概念效果图。',
      video:'00–05 秒｜作品整体：用一个细节引出主题。\n05–20 秒｜创作者讲述：从提供的口述中选择一句真实表达。\n20–40 秒｜制作过程：安排两至三个实拍工序镜头。\n40–55 秒｜局部与完成状态：展示材料和手工痕迹。\n55–60 秒｜署名收尾：核对作品名、作者与字幕。\n素材准备：竖屏实拍、干净的人声、已获授权的音乐。'
    };
    const labels:Record<string,string>={article:'作品图文',design:'设计方案',video:'一分钟视频'};
    exportText=`# ${title}｜${labels[output]}创作任务单\n\n创作领域：${medium}\n\n## 你提供的素材\n${story}\n\n## 建议制作结构\n${plans[output]}\n\n## 发布前确认\n- 作者、年代、材料和工艺术语已核对。\n- 作品图片、人物形象与音乐的使用范围已确认。\n- AI 生成内容与真实记录已区分。\n- 创作者已完成最终审核。\n\n说明：这是一份在浏览器本地依据固定模板整理的任务单，未调用云端 AI，也未生成图片或视频。\n`;
    const empty=document.querySelector<HTMLElement>('#result-empty');if(empty)empty.hidden=true;
    const result=document.querySelector<HTMLElement>('#result-content');if(result)result.hidden=false;
    const heading=document.querySelector('#result-title');if(heading)heading.textContent=`${title} · ${labels[output]}`;
    const body=document.querySelector('#result-text');if(body)body.textContent=`创作领域：${medium}\n\n你提供的素材\n${story}\n\n建议制作结构\n${plans[output]}`;
    const status=document.querySelector<HTMLElement>('#brief-status');if(status)status.textContent='任务单已整理，可以继续修改输入并重新整理，或下载保存。';
    result?.focus({preventScroll:true});
  });
  on(document.querySelector('#download-brief'),'click',()=>{if(!exportText)return;const blob=new Blob(['\uFEFF'+exportText],{type:'text/markdown;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='AI奥杰-创作任务单.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  const coverage=document.querySelector<HTMLInputElement>('#coverage');
  const updateCoverage=()=>{if(!coverage)return;const n=Number(coverage.value);const out=document.querySelector('#coverage-value');if(out)out.textContent=`${n}%`;document.querySelectorAll<HTMLElement>('[data-bar]').forEach((bar,i)=>{const value=Math.max(8,Math.min(100,Math.round(n*[1,.85,.62][i])));bar.style.width=`${value}%`;const label=document.querySelector(`[data-bar-label="${i}"]`);if(label)label.textContent=`${value}%`;});const summary=document.querySelector('#research-summary');if(summary)summary.textContent=n<40?'资料较少：先补足作品身份、来源与基本字段，暂不进入比较分析。':n<75?'资料正在完善：可以梳理研究问题，比较样本仍需核验和补充。':'资料较充分：可组织比较研究，结论仍需专业人员复核。';};
  on(coverage,'input',updateCoverage);updateCoverage();
}
document.addEventListener('astro:page-load',setup);
document.addEventListener('astro:before-swap',()=>cleanup?.());
