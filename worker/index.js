const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
}

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status, headers: { 'Content-Type': 'application/json', ...CORS },
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

        if (request.method === 'OPTIONS') return new Response(null, { headers: CORS })

        // GET /projects — public, images inlined from KV
        if (request.method === 'GET' && path === '/projects') {
            const raw = await env.PROJECTS_KV.get('projects')
            const projects = raw ? JSON.parse(raw) : getDefaults()

            // Attach stored images
            const withImages = await Promise.all(projects.map(async p => {
                if (p.image && p.image.startsWith('kv:')) {
                    const imgData = await env.PROJECTS_KV.get(`img:${p.id}`)
                    return { ...p, image: imgData || '' }
                }
                return p
            }))
            return json(withImages)
        }

        // PUT /projects — admin only
        if (request.method === 'PUT' && path === '/projects') {
            if (!isAdmin(request, env)) return err('Unauthorized', 401)
            const projects = await request.json()
            if (!Array.isArray(projects)) return err('Expected array')

            // Separate out base64 images into their own KV keys to keep the
            // projects list lean (KV values have a 25 MB limit per value).
            const stripped = await Promise.all(projects.map(async p => {
                if (p.image && p.image.startsWith('data:')) {
                    await env.PROJECTS_KV.put(`img:${p.id}`, p.image)
                    return { ...p, image: 'kv:' + p.id }
                }
                // If image was already stored as kv: reference, keep it
                return p
            }))

            await env.PROJECTS_KV.put('projects', JSON.stringify(stripped))
            return json({ ok: true, count: stripped.length })
        }

        // DELETE /projects/:id — admin only
        if (request.method === 'DELETE' && path.startsWith('/projects/')) {
            if (!isAdmin(request, env)) return err('Unauthorized', 401)
            const id = path.split('/')[2]
            const raw = await env.PROJECTS_KV.get('projects')
            const projects = raw ? JSON.parse(raw) : []
            await env.PROJECTS_KV.put('projects', JSON.stringify(projects.filter(p => p.id !== id)))
            // Clean up image if stored
            await env.PROJECTS_KV.delete(`img:${id}`)
            return json({ ok: true })
        }

        return err('Not found', 404)
    }
}

function getDefaults() {
    return [
        {
            id: 'mineguardian', name: 'MineGuardian',
            description: 'A full-stack Minecraft server management dashboard. Monitor players, control your server, view real-time stats.',
            status: 'live', tags: ['React', 'Flask', 'Socket.IO', 'Minecraft'],
            url: 'https://frontend.silentlab.work', image: '',
            accentColor: 'linear-gradient(90deg, #39ff14, #00ffcc)', featured: true,
        },
        {
            id: 'septionapp', name: 'SeptionAPP',
            description: 'An agentic AI Discord bot powered by OpenClaw. Sandboxed service with configurable model providers.',
            status: 'wip', tags: ['AI', 'Discord', 'Python'],
            url: '', image: '', accentColor: 'linear-gradient(90deg, #821bef, #00ffcc)', featured: false,
        },
    ]
}
