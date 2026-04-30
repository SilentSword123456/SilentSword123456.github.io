import { useState, useEffect } from 'react'

// Replace after you deploy the worker
const WORKER_URL = 'https://silentlab-api.andrei925-dumitru.workers.dev'

export function useProjects() {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetch(`${WORKER_URL}/projects`)
            .then(r => r.json())
            .then(data => { setProjects(data); setLoading(false) })
            .catch(e => { setError(e.message); setLoading(false) })
    }, [])

    return { projects, loading, error, setProjects }
}

export async function saveProjects(projects, adminKey) {
    const res = await fetch(`${WORKER_URL}/projects`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminKey },
        body: JSON.stringify(projects),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
}

export async function deleteProject(id, adminKey) {
    const res = await fetch(`${WORKER_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Key': adminKey },
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
}

export { WORKER_URL }