import { useState } from 'react'
import { useProjects, saveProjects, deleteProject } from '../hooks/useProjects.js'
import styles from './Admin.module.css'

const EMPTY_PROJECT = {
  id: '',
  name: '',
  description: '',
  status: 'wip',
  tags: '',
  url: '',
  image: '',
  accentColor: 'linear-gradient(90deg, #00ffcc, #821bef)',
  featured: false,
}

export default function Admin() {
  const [adminKey, setAdminKey] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [form, setForm] = useState(EMPTY_PROJECT)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const { projects, loading, setProjects } = useProjects()

  async function handleAuth(e) {
    e.preventDefault()
    // We verify the key lazily — first real write will tell us if it's wrong.
    // But we do a quick GET with the key to validate.
    try {
      const res = await fetch(`${(await import('../hooks/useProjects.js')).WORKER_URL}/projects`, {
        headers: { 'X-Admin-Key': adminKey }
      })
      if (res.ok) { setAuthed(true); setAuthError('') }
      else setAuthError('Wrong key.')
    } catch { setAuthError('Could not reach the worker.') }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    const newProject = {
      ...form,
      id: form.id || Date.now().toString(),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    }
    const updated = [...projects, newProject]
    setSaving(true)
    try {
      await saveProjects(updated, adminKey)
      setProjects(updated)
      setForm(EMPTY_PROJECT)
      setMsg('✓ Project added.')
    } catch (e) {
      setMsg('✗ Error: ' + e.message)
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this project?')) return
    setSaving(true)
    try {
      await deleteProject(id, adminKey)
      setProjects(p => p.filter(x => x.id !== id))
      setMsg('✓ Deleted.')
    } catch (e) {
      setMsg('✗ Error: ' + e.message)
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  async function handleToggleFeatured(id) {
    const updated = projects.map(p => ({ ...p, featured: p.id === id ? !p.featured : false }))
    setSaving(true)
    try {
      await saveProjects(updated, adminKey)
      setProjects(updated)
      setMsg('✓ Updated.')
    } catch (e) {
      setMsg('✗ ' + e.message)
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  if (!authed) {
    return (
      <div className={styles.authWrap}>
        <div className={styles.authBox}>
          <p className={styles.label}>// silentlab admin</p>
          <h1 className={styles.authTitle}>Access Required</h1>
          <form onSubmit={handleAuth} className={styles.authForm}>
            <input
              type="password"
              placeholder="Admin key"
              value={adminKey}
              onChange={e => setAdminKey(e.target.value)}
              autoFocus
            />
            <button type="submit" className={styles.btn}>Enter →</button>
          </form>
          {authError && <p className={styles.error}>{authError}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <p className={styles.label}>// silentlab admin</p>
        <h1 className={styles.title}>Project Manager</h1>
        <a href="/" className={styles.backLink}>← back to site</a>
      </header>

      {msg && <div className={styles.msg}>{msg}</div>}

      {/* ADD FORM */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Add Project</h2>
        <form onSubmit={handleAdd} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="MineGuardian" />
            </div>
            <div className={styles.field}>
              <label>ID (leave blank to auto-generate)</label>
              <input name="id" value={form.id} onChange={handleChange} placeholder="mineguardian" />
            </div>
          </div>

          <div className={styles.field}>
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="What does this project do?" rows={3} style={{resize:'vertical'}} />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="live">Live</option>
                <option value="wip">In development</option>
                <option value="soon">Soon</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>URL</label>
              <input name="url" value={form.url} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Tags (comma-separated)</label>
              <input name="tags" value={form.tags} onChange={handleChange} placeholder="React, Flask, Python" />
            </div>
            <div className={styles.field}>
              <label>Image URL</label>
              <input name="image" value={form.image} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Accent color (CSS gradient or color)</label>
              <input name="accentColor" value={form.accentColor} onChange={handleChange} />
            </div>
            <div className={styles.fieldInline}>
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} id="feat" />
              <label htmlFor="feat">Featured (full-width card)</label>
            </div>
          </div>

          <button type="submit" className={styles.btn} disabled={saving}>
            {saving ? 'Saving...' : '+ Add Project'}
          </button>
        </form>
      </section>

      {/* PROJECT LIST */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Current Projects</h2>
        {loading ? (
          <p className={styles.muted}>Loading...</p>
        ) : projects.length === 0 ? (
          <p className={styles.muted}>No projects yet.</p>
        ) : (
          <div className={styles.list}>
            {projects.map(p => (
              <div key={p.id} className={styles.listItem}>
                <div className={styles.listInfo}>
                  <span className={styles.listName}>{p.name}</span>
                  <span className={`${styles.badge} ${styles[p.status]}`}>{p.status}</span>
                  {p.featured && <span className={styles.featBadge}>featured</span>}
                </div>
                <p className={styles.listDesc}>{p.description}</p>
                <div className={styles.listActions}>
                  <button
                    className={styles.btnSmall}
                    onClick={() => handleToggleFeatured(p.id)}
                    disabled={saving}
                  >
                    {p.featured ? 'unfeature' : 'set featured'}
                  </button>
                  <button
                    className={`${styles.btnSmall} ${styles.danger}`}
                    onClick={() => handleDelete(p.id)}
                    disabled={saving}
                  >
                    delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
