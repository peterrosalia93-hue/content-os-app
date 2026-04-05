const STORAGE_KEY = 'content-os-app-state-v1'

const stages = ['inbox', 'research', 'ideas', 'drafts', 'approvals', 'published']
const plannerDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const approvalFlow = ['not-needed', 'pending', 'in-review', 'approved', 'rejected']

const defaultState = {
  selectedId: 'item-1',
  weeklyPlan: {
    thesis: 'Turn research into one short-form asset and one authority post each day.',
    priorityProjects: ['Content OS MVP', 'AI filmmaking workflow'],
    approvalCheckpoints: ['Review spirituality claims before publish', 'Review founder posts before Friday slots'],
    reuseOpportunities: ['Turn approved short into X thread', 'Expand founder lesson into carousel'],
  },
  items: [
    {
      id: 'item-1',
      title: 'African spirituality myths worth questioning',
      pillar: 'African spirituality',
      stage: 'research',
      approvalStatus: 'in-review',
      platformTargets: ['Instagram', 'TikTok', 'X'],
      objective: 'Authority-building',
      audience: 'Curious seekers and cultural storytellers',
      hook: 'What if half the spiritual facts online are just recycled guesswork?',
      body: 'Use research notes to separate grounded cultural wisdom from internet mythology, then turn the nuance into a concise short-form explainer.',
      cta: 'Comment "part 2" for the next breakdown.',
      sourceType: 'NotebookLM summary',
      sourceLink: '',
      riskNotes: 'Frame interpretations carefully and avoid presenting spiritual claims as absolute fact.',
      visualNeeds: 'Talking-head clip + symbolic b-roll',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'item-2',
      title: 'Behind the scenes of the next AI film workflow',
      pillar: 'Filmmaking',
      stage: 'drafts',
      approvalStatus: 'pending',
      platformTargets: ['Instagram', 'YouTube'],
      objective: 'Build in public',
      audience: 'Indie creators and AI-curious filmmakers',
      hook: 'This is the exact workflow I am testing to ship faster without losing story quality.',
      body: 'Break down research, visual references, script iteration, and where AI helps versus where human direction still matters.',
      cta: 'Save this if you want the full template pack.',
      sourceType: 'Project note',
      sourceLink: '',
      riskNotes: 'Low risk.',
      visualNeeds: 'Screen recording + storyboard stills',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'item-3',
      title: 'Daily discipline reset for founders',
      pillar: 'Entrepreneurship',
      stage: 'approvals',
      approvalStatus: 'approved',
      platformTargets: ['LinkedIn', 'X'],
      objective: 'Engagement',
      audience: 'Builders and founders',
      hook: 'Most founders do not need more motivation. They need a tighter operating rhythm.',
      body: 'Turn a morning discipline checklist into a concise authority post with one lesson, one challenge, and one actionable reset.',
      cta: 'Reply with the ritual you never skip.',
      sourceType: 'Idea dump',
      sourceLink: '',
      riskNotes: 'Low risk.',
      visualNeeds: 'Minimal text visual',
      updatedAt: new Date().toISOString(),
    },
  ],
  planner: [
    { id: 'plan-1', day: 'Monday', time: '08:30', title: 'Authority short', platform: 'Instagram', focus: 'Spirituality myth breakdown' },
    { id: 'plan-2', day: 'Wednesday', time: '14:00', title: 'Build-in-public update', platform: 'LinkedIn', focus: 'Content OS progress' },
    { id: 'plan-3', day: 'Friday', time: '19:30', title: 'Founder reflection', platform: 'X', focus: 'Discipline and system lesson' },
  ],
  packs: [],
}

const elements = {
  metricGrid: document.getElementById('metricGrid'),
  approvalQueue: document.getElementById('approvalQueue'),
  queueCount: document.getElementById('queueCount'),
  pipelineBoard: document.getElementById('pipelineBoard'),
  plannerGrid: document.getElementById('plannerGrid'),
  weeklyThesis: document.getElementById('weeklyThesis'),
  priorityProjects: document.getElementById('priorityProjects'),
  approvalCheckpoints: document.getElementById('approvalCheckpoints'),
  reuseOpportunities: document.getElementById('reuseOpportunities'),
  itemForm: document.getElementById('itemForm'),
  editorTitle: document.getElementById('editorTitle'),
  packDate: document.getElementById('packDate'),
  packSummary: document.getElementById('packSummary'),
  shortsList: document.getElementById('shortsList'),
  shortCount: document.getElementById('shortCount'),
  authorityPlatform: document.getElementById('authorityPlatform'),
  authorityPost: document.getElementById('authorityPost'),
  buildProject: document.getElementById('buildProject'),
  buildPost: document.getElementById('buildPost'),
  carryCount: document.getElementById('carryCount'),
  carryList: document.getElementById('carryList'),
  packHistoryCount: document.getElementById('packHistoryCount'),
  packHistory: document.getElementById('packHistory'),
}

const state = loadState()
const form = elements.itemForm
const stageSelect = form.elements.stage
const approvalSelect = form.elements.approvalStatus

stages.forEach((stage) => stageSelect.add(new Option(toLabel(stage), stage)))
approvalFlow.forEach((status) => approvalSelect.add(new Option(toLabel(status), status)))

document.getElementById('newItemButton').addEventListener('click', () => {
  state.selectedId = null
  fillForm(createEmptyItem())
  elements.editorTitle.textContent = 'New item'
})

document.getElementById('resetFormButton').addEventListener('click', () => {
  if (state.selectedId) {
    fillForm(findSelectedItem())
  } else {
    fillForm(createEmptyItem())
  }
})

document.getElementById('generatePackButton').addEventListener('click', () => {
  generateDailyPack()
  switchView('packs')
})

document.querySelectorAll('.tabs button').forEach((button) => {
  button.addEventListener('click', () => switchView(button.dataset.view))
})

form.addEventListener('submit', (event) => {
  event.preventDefault()
  const formData = new FormData(form)
  const payload = {
    id: state.selectedId || `item-${Date.now()}`,
    title: String(formData.get('title') || '').trim(),
    pillar: String(formData.get('pillar') || '').trim(),
    stage: String(formData.get('stage') || 'inbox'),
    approvalStatus: String(formData.get('approvalStatus') || 'pending'),
    platformTargets: String(formData.get('platformTargets') || '').split(',').map((value) => value.trim()).filter(Boolean),
    objective: String(formData.get('objective') || '').trim(),
    audience: String(formData.get('audience') || '').trim(),
    hook: String(formData.get('hook') || '').trim(),
    body: String(formData.get('body') || '').trim(),
    cta: String(formData.get('cta') || '').trim(),
    sourceType: String(formData.get('sourceType') || '').trim(),
    sourceLink: String(formData.get('sourceLink') || '').trim(),
    riskNotes: String(formData.get('riskNotes') || '').trim(),
    visualNeeds: String(formData.get('visualNeeds') || '').trim(),
    updatedAt: new Date().toISOString(),
  }

  if (!payload.title) return

  const existingIndex = state.items.findIndex((item) => item.id === payload.id)
  if (existingIndex >= 0) {
    state.items[existingIndex] = payload
  } else {
    state.items.unshift(payload)
  }
  state.selectedId = payload.id
  saveState()
  render()
})

render()

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : structuredClone(defaultState)
  } catch {
    return structuredClone(defaultState)
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function createEmptyItem() {
  return {
    id: '',
    title: '',
    pillar: 'Filmmaking',
    stage: 'inbox',
    approvalStatus: 'pending',
    platformTargets: ['Instagram'],
    objective: '',
    audience: '',
    hook: '',
    body: '',
    cta: '',
    sourceType: 'Manual note',
    sourceLink: '',
    riskNotes: '',
    visualNeeds: '',
  }
}

function findSelectedItem() {
  return state.items.find((item) => item.id === state.selectedId) || state.items[0] || createEmptyItem()
}

function fillForm(item) {
  form.elements.title.value = item.title || ''
  form.elements.pillar.value = item.pillar || ''
  form.elements.stage.value = item.stage || 'inbox'
  form.elements.approvalStatus.value = item.approvalStatus || 'pending'
  form.elements.platformTargets.value = (item.platformTargets || []).join(', ')
  form.elements.objective.value = item.objective || ''
  form.elements.audience.value = item.audience || ''
  form.elements.sourceType.value = item.sourceType || ''
  form.elements.sourceLink.value = item.sourceLink || ''
  form.elements.hook.value = item.hook || ''
  form.elements.body.value = item.body || ''
  form.elements.cta.value = item.cta || ''
  form.elements.visualNeeds.value = item.visualNeeds || ''
  form.elements.riskNotes.value = item.riskNotes || ''
}

function render() {
  renderMetrics()
  renderQueue()
  renderPipeline()
  renderPlanner()
  renderPack()
  renderWeeklyPlan()
  const selected = findSelectedItem()
  fillForm(selected)
  elements.editorTitle.textContent = state.selectedId ? 'Edit item' : 'New item'
}

function renderMetrics() {
  const approved = state.items.filter((item) => item.approvalStatus === 'approved').length
  const pending = state.items.filter((item) => ['pending', 'in-review'].includes(item.approvalStatus)).length
  const metrics = [
    ['Total items', state.items.length],
    ['Pending review', pending],
    ['Approved', approved],
    ['Planned slots', state.planner.length],
  ]
  elements.metricGrid.innerHTML = metrics.map(([label, value]) => `<article class="metric-card"><span>${label}</span><strong>${value}</strong></article>`).join('')
}

function renderQueue() {
  const queue = state.items.filter((item) => ['pending', 'in-review'].includes(item.approvalStatus))
  elements.queueCount.textContent = `${queue.length} active`
  if (!queue.length) {
    elements.approvalQueue.innerHTML = '<div class="empty-card">Nothing waiting for review.</div>'
    return
  }
  elements.approvalQueue.innerHTML = queue.map((item) => `
    <button class="queue-item" data-select-id="${item.id}">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${toLabel(item.approvalStatus)} | ${escapeHtml(item.platformTargets.join(', '))}</span>
    </button>
  `).join('')
  bindSelectionButtons()
}

function renderPipeline() {
  elements.pipelineBoard.innerHTML = stages.map((stage) => {
    const items = state.items.filter((item) => item.stage === stage)
    const inner = items.length
      ? items.map((item) => `
        <button class="content-card ${state.selectedId === item.id ? 'selected' : ''}" data-select-id="${item.id}">
          <span class="pill">${escapeHtml(item.pillar)}</span>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.hook)}</p>
          <div class="card-meta"><span>${toLabel(item.approvalStatus)}</span><span>${escapeHtml(item.platformTargets.join(', '))}</span></div>
        </button>
      `).join('')
      : `<div class="empty-card">No items in ${toLabel(stage).toLowerCase()}.</div>`
    return `<div class="panel pipeline-column"><div class="section-heading"><h2>${toLabel(stage)}</h2><span>${items.length}</span></div><div class="column-stack">${inner}</div></div>`
  }).join('')
  bindSelectionButtons()
}

function bindSelectionButtons() {
  document.querySelectorAll('[data-select-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedId = button.dataset.selectId
      saveState()
      render()
    })
  })
}

function renderPlanner() {
  elements.plannerGrid.innerHTML = plannerDays.map((day) => {
    const entries = state.planner.filter((entry) => entry.day === day)
    const stack = entries.length ? entries.map((entry) => `
      <div class="planner-entry">
        <input value="${escapeHtml(entry.time)}" data-plan-id="${entry.id}" data-plan-field="time" />
        <input value="${escapeHtml(entry.title)}" data-plan-id="${entry.id}" data-plan-field="title" />
        <input value="${escapeHtml(entry.platform)}" data-plan-id="${entry.id}" data-plan-field="platform" />
        <textarea rows="3" data-plan-id="${entry.id}" data-plan-field="focus">${escapeHtml(entry.focus)}</textarea>
      </div>
    `).join('') : '<div class="empty-card">No planned content.</div>'
    return `<article class="panel planner-card"><div class="section-heading"><h2>${day}</h2><button class="tiny-button" data-add-day="${day}">+ slot</button></div><div class="planner-stack">${stack}</div></article>`
  }).join('')

  document.querySelectorAll('[data-add-day]').forEach((button) => {
    button.addEventListener('click', () => {
      state.planner.push({ id: `plan-${Date.now()}`, day: button.dataset.addDay, time: '09:00', title: 'New content block', platform: 'Instagram', focus: 'Draft angle' })
      saveState()
      renderPlanner()
      renderMetrics()
    })
  })

  document.querySelectorAll('[data-plan-id]').forEach((input) => {
    input.addEventListener('input', () => {
      const entry = state.planner.find((item) => item.id === input.dataset.planId)
      if (!entry) return
      entry[input.dataset.planField] = input.value
      saveState()
    })
  })
}

function renderWeeklyPlan() {
  const weeklyPlan = state.weeklyPlan || structuredClone(defaultState.weeklyPlan)
  elements.weeklyThesis.value = weeklyPlan.thesis || ''
  elements.priorityProjects.value = (weeklyPlan.priorityProjects || []).join('\n')
  elements.approvalCheckpoints.value = (weeklyPlan.approvalCheckpoints || []).join('\n')
  elements.reuseOpportunities.value = (weeklyPlan.reuseOpportunities || []).join('\n')

  ;[
    ['weeklyThesis', 'thesis'],
    ['priorityProjects', 'priorityProjects'],
    ['approvalCheckpoints', 'approvalCheckpoints'],
    ['reuseOpportunities', 'reuseOpportunities'],
  ].forEach(([elementKey, field]) => {
    elements[elementKey].oninput = (event) => {
      const value = event.target.value
      state.weeklyPlan[field] = field === 'thesis'
        ? value
        : value.split('\n').map((entry) => entry.trim()).filter(Boolean)
      saveState()
    }
  })
}

function generateDailyPack() {
  const sourceItems = [...state.items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3)
  if (!sourceItems.length) return
  const primary = sourceItems[0]
  const queue = state.items.filter((item) => ['pending', 'in-review'].includes(item.approvalStatus)).map((item) => item.title).slice(0, 5)
  const pack = {
    id: `pack-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    objective: primary.objective || 'Create one short-form asset and one authority post',
    priorityPillar: primary.pillar,
    sourceInputs: sourceItems.map((item) => `${item.title} (${item.sourceType})`),
    hooks: sourceItems.flatMap((item) => [item.hook, `Angle: ${item.title} for ${item.audience || 'core audience'}`, `What matters now about ${item.pillar.toLowerCase()}?`]).slice(0, 10),
    shorts: sourceItems.slice(0, 2).map((item) => ({ platform: item.platformTargets[0] || 'Instagram', hook: item.hook, script: item.body, cta: item.cta })),
    authorityPost: {
      platform: primary.platformTargets[0] || 'LinkedIn',
      title: primary.title,
      draft: `${primary.hook}\n\n${primary.body}\n\nCTA: ${primary.cta}`,
    },
    buildInPublic: {
      project: 'Content OS',
      angle: `What moved from ${toLabel(primary.stage)} to ${toLabel(primary.approvalStatus)} today`,
      draft: `Today the system tightened one key content loop: ${primary.title}. Next step is to turn it into channel-specific variations without breaking the approval gate.`,
    },
    approvalQueue: queue,
  }
  state.packs.unshift(pack)
  saveState()
  renderPack()
}

function renderPack() {
  const pack = state.packs[0]
  if (!pack) {
    elements.packDate.textContent = 'Not generated yet'
    elements.packSummary.innerHTML = 'Generate a daily pack from your most recent items.'
    elements.shortsList.innerHTML = ''
    elements.shortCount.textContent = '0'
    elements.authorityPlatform.textContent = '-'
    elements.authorityPost.innerHTML = 'No pack yet.'
    elements.buildProject.textContent = '-'
    elements.buildPost.innerHTML = 'No pack yet.'
    elements.carryCount.textContent = '0'
    elements.carryList.innerHTML = ''
    elements.packHistoryCount.textContent = '0'
    elements.packHistory.innerHTML = ''
    return
  }

  elements.packDate.textContent = pack.date
  elements.packSummary.innerHTML = `
    <div class="pack-content">
      <div><p class="label">Objective</p><p>${escapeHtml(pack.objective)}</p></div>
      <div><p class="label">Priority pillar</p><p>${escapeHtml(pack.priorityPillar)}</p></div>
      <div><p class="label">Source inputs</p><ul>${pack.sourceInputs.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
      <div><p class="label">Hooks</p><ol>${pack.hooks.map((hook) => `<li>${escapeHtml(hook)}</li>`).join('')}</ol></div>
    </div>
  `
  elements.shortsList.innerHTML = pack.shorts.map((short) => `<div class="pack-block"><p class="label">${escapeHtml(short.platform)}</p><strong>${escapeHtml(short.hook)}</strong><p>${escapeHtml(short.script)}</p><span>CTA: ${escapeHtml(short.cta)}</span></div>`).join('')
  elements.shortCount.textContent = String(pack.shorts.length)
  elements.authorityPlatform.textContent = pack.authorityPost.platform
  elements.authorityPost.innerHTML = `<div class="pack-block"><strong>${escapeHtml(pack.authorityPost.title)}</strong><p>${escapeHtml(pack.authorityPost.draft)}</p></div>`
  elements.buildProject.textContent = pack.buildInPublic.project
  elements.buildPost.innerHTML = `<div class="pack-block"><strong>${escapeHtml(pack.buildInPublic.angle)}</strong><p>${escapeHtml(pack.buildInPublic.draft)}</p></div>`
  elements.carryCount.textContent = String(pack.approvalQueue.length)
  elements.carryList.innerHTML = pack.approvalQueue.length ? pack.approvalQueue.map((item) => `<div class="queue-item static">${escapeHtml(item)}</div>`).join('') : '<div class="empty-card">No carryover approvals.</div>'
  elements.packHistoryCount.textContent = String(state.packs.length)
  elements.packHistory.innerHTML = state.packs.map((entry) => `
    <div class="queue-item static">
      <strong>${escapeHtml(entry.date)}</strong>
      <span>${escapeHtml(entry.priorityPillar)}</span>
      <span>${escapeHtml(entry.objective)}</span>
    </div>
  `).join('')
}

function switchView(view) {
  document.querySelectorAll('.tabs button').forEach((button) => button.classList.toggle('active', button.dataset.view === view))
  document.querySelectorAll('.view').forEach((section) => section.classList.toggle('active', section.id === `${view}View`))
}

function toLabel(value) {
  return value.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
