const CORS = {
    'Access-Control-Allow-Origin': 'https://silentlab.work',
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
}

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status, headers: { 'Content-Type': 'application/json', ...CORS },
    })
}
function err(msg, status = 400) {
    return new Response(msg, { status, headers: CORS })
}
function isAdmin(request) {
    // Cloudflare Access sets this header after authenticating the user.
    // It is cryptographically signed by Cloudflare and cannot be spoofed.
    return !!request.headers.get('Cf-Access-Authenticated-User-Email')
}

async function pingUrl(url) {
    try {
        const res = await fetch(url, {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000),
            redirect: 'follow',
        })
        return res.ok ? 'up' : 'down'
    } catch {
        return 'down'
    }
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url)
        const path = url.pathname

        if (request.method === 'OPTIONS') return new Response(null, { headers: CORS })

        // GET /projects — public
        if (request.method === 'GET' && path === '/projects') {
            const raw = await env.PROJECTS_KV.get('projects')
            const projects = raw ? JSON.parse(raw) : getDefaults()

            const withData = await Promise.all(projects.map(async p => {
                if (p.image && p.image.startsWith('kv:')) {
                    const imgData = await env.PROJECTS_KV.get(`img:${p.id}`)
                    p = { ...p, image: imgData || '' }
                }
                const ping = await env.PROJECTS_KV.get(`ping:${p.id}`)
                return { ...p, pingStatus: ping || 'unknown' }
            }))
            return json(withData)
        }

        // GET /ping/:id — admin only
        if (request.method === 'GET' && path.startsWith('/ping/')) {
            if (!isAdmin(request)) return err('Unauthorized', 401)
            const id = path.split('/')[2]
            const raw = await env.PROJECTS_KV.get('projects')
            const projects = raw ? JSON.parse(raw) : getDefaults()
            const project = projects.find(p => p.id === id)
            if (!project) return err('Not found', 404)
            if (!project.pingUrl) return json({ pingStatus: 'unknown' })
            const status = await pingUrl(project.pingUrl)
            await env.PROJECTS_KV.put(`ping:${id}`, status, { expirationTtl: 300 })
            return json({ pingStatus: status })
        }

        // PUT /projects — admin only
        if (request.method === 'PUT' && path === '/projects') {
            if (!isAdmin(request)) return err('Unauthorized', 401)
            const projects = await request.json()
            if (!Array.isArray(projects)) return err('Expected array')

            const stripped = await Promise.all(projects.map(async p => {
                if (p.image && p.image.startsWith('data:')) {
                    await env.PROJECTS_KV.put(`img:${p.id}`, p.image)
                    return { ...p, image: 'kv:' + p.id }
                }
                return p
            }))

            await env.PROJECTS_KV.put('projects', JSON.stringify(stripped))
            return json({ ok: true, count: stripped.length })
        }

        // DELETE /projects/:id — admin only
        if (request.method === 'DELETE' && path.startsWith('/projects/')) {
            if (!isAdmin(request)) return err('Unauthorized', 401)
            const id = path.split('/')[2]
            const raw = await env.PROJECTS_KV.get('projects')
            const projects = raw ? JSON.parse(raw) : []
            await env.PROJECTS_KV.put('projects', JSON.stringify(projects.filter(p => p.id !== id)))
            await env.PROJECTS_KV.delete(`img:${id}`)
            await env.PROJECTS_KV.delete(`ping:${id}`)
            return json({ ok: true })
        }

        return err('Not found', 404)
    },

    async scheduled(event, env) {
        const raw = await env.PROJECTS_KV.get('projects')
        if (!raw) return
        const projects = JSON.parse(raw)
        await Promise.all(projects.map(async p => {
            if (!p.pingUrl) return
            const status = await pingUrl(p.pingUrl)
            await env.PROJECTS_KV.put(`ping:${p.id}`, status, { expirationTtl: 600 })
        }))
    }
}

function getDefaults() {
    return [
        {
            id: 'mineguardian', name: 'MineGuardian',
            description: 'A full-stack Minecraft server management dashboard. Monitor players, control your server, view real-time stats.',
            status: 'live', tags: ['React', 'Flask', 'Socket.IO', 'Minecraft'],
            url: 'https://frontend.silentlab.work', pingUrl: 'https://frontend.silentlab.work',
            image: '', accentColor: 'linear-gradient(90deg, #39ff14, #00ffcc)', featured: true,
        },
        {
            id: 'septionapp', name: 'SeptionAPP',
            description: 'An agentic AI Discord bot powered by OpenClaw. Sandboxed service with configurable model providers.',
            status: 'wip', tags: ['AI', 'Discord', 'Python'],
            url: '', pingUrl: '', image: '', accentColor: 'linear-gradient(90deg, #821bef, #00ffcc)', featured: false,
        },
    ]
}