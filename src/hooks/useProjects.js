import { useState, useEffect } from 'react'

const WORKER_URL = 'https://api.silentlab.work'

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

export async function saveProjects(projects) {
    const res = await fetch(`${WORKER_URL}/projects`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projects),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
}

export async function deleteProject(id) {
    const res = await fetch(`${WORKER_URL}/projects/${id}`, {
        method: 'DELETE',
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
}

export { WORKER_URL }