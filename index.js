/**
 * SilentLab Projects API
 * Cloudflare Worker + KV
 *
 * Routes:
 *   GET  /projects         → returns all projects (public)
 *   PUT  /projects         → replace all projects (admin)
 *   DELETE /projects/:id   → delete one project (admin)
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}

function err(msg, status = 400) {
  return new Response(msg, { status, headers: CORS })
}

function isAdmin(request, env) {
  return request.headers.get('X-Admin-Key') === env.ADMIN_KEY
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS })
    }

    // GET /projects — public
    if (request.method === 'GET' && path === '/projects') {
      const raw = await env.PROJECTS_KV.get('projects')
      const projects = raw ? JSON.parse(raw) : getDefaultProjects()
      return json(projects)
    }

    // PUT /projects — admin only, replaces entire list
    if (request.method === 'PUT' && path === '/projects') {
      if (!isAdmin(request, env)) return err('Unauthorized', 401)
      const projects = await request.json()
      if (!Array.isArray(projects)) return err('Expected an array')
      await env.PROJECTS_KV.put('projects', JSON.stringify(projects))
      return json({ ok: true, count: projects.length })
    }

    // DELETE /projects/:id — admin only
    if (request.method === 'DELETE' && path.startsWith('/projects/')) {
      if (!isAdmin(request, env)) return err('Unauthorized', 401)
      const id = path.split('/')[2]
      const raw = await env.PROJECTS_KV.get('projects')
      const projects = raw ? JSON.parse(raw) : []
      const updated = projects.filter(p => p.id !== id)
      await env.PROJECTS_KV.put('projects', JSON.stringify(updated))
      return json({ ok: true })
    }

    return err('Not found', 404)
  },
}

// Seeded on first deploy so the site isn't empty
function getDefaultProjects() {
  return [
    {
      id: 'mineguardian',
      name: 'MineGuardian',
      description: 'A full-stack Minecraft server management dashboard. Monitor players, control your server, view real-time stats — all from a clean web interface.',
      status: 'live',
      tags: ['React', 'Flask', 'Socket.IO', 'Minecraft'],
      url: 'https://frontend.silentlab.work',
      image: '',
      accentColor: 'linear-gradient(90deg, #39ff14, #00ffcc)',
      featured: true,
    },
    {
      id: 'septionapp',
      name: 'SeptionAPP',
      description: 'An agentic AI Discord bot powered by OpenClaw. Runs as a sandboxed service with configurable model providers.',
      status: 'wip',
      tags: ['AI', 'Discord', 'Python'],
      url: '',
      image: '',
      accentColor: 'linear-gradient(90deg, #821bef, #00ffcc)',
      featured: false,
    },
  ]
}
