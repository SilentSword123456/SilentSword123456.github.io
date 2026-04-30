import { useState, useRef } from 'react'
import { useProjects, saveProjects, deleteProject } from '../hooks/useProjects.js'
import styles from './Admin.module.css'

const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 5 * 60 * 1000 // 5 minutes

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

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function Admin() {
  const [adminKey, setAdminKey] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState(null)

  const [form, setForm] = useState(EMPTY_PROJECT)
  const [editingId, setEditingId] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef(null)

  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const { projects, loading, setProjects } = useProjects()

  function isLocked() {
    if (!lockedUntil) return false
    if (Date.now() < lockedUntil) return true
    setLockedUntil(null)
    setAttempts(0)
    return false
  }

  function lockoutRemaining() {
    if (!lockedUntil) return 0
    return Math.ceil((lockedUntil - Date.now()) / 1000)
  }

  async function handleAuth(e) {
    e.preventDefault()
    if (isLocked()) return
    try {
      const { WORKER_URL } = await import('../hooks/useProjects.js')
      const res = await fetch(`${WORKER_URL}/projects`, {
        headers: { 'X-Admin-Key': adminKey },
      })
      if (res.ok) {
        setAuthed(true)
        setAuthError('')
        setAttempts(0)
      } else {
        const next = attempts + 1
        setAttempts(next)
        if (next >= MAX_ATTEMPTS) {
          setLockedUntil(Date.now() + LOCKOUT_MS)
          setAuthError('Too many failed attempts. Locked out for 5 minutes.')
        } else {
          setAuthError(`Wrong key. ${MAX_ATTEMPTS - next} attempt${MAX_ATTEMPTS - next === 1 ? '' : 's'} remaining.`)
        }
      }
    } catch {
      setAuthError('Could not reach the worker.')
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleImagePick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 1.5 * 1024 * 1024) {
      setMsg('Image too large (max 1.5 MB)')
      setTimeout(() => setMsg(''), 3000)
      return
    }
    const b64 = await fileToBase64(file)
    setImagePreview(b64)
    setForm(f => ({ ...f, image: b64 }))
  }

  function clearImage() {
    setImagePreview('')
    setForm(f => ({ ...f, image: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function startEdit(project) {
    setEditingId(project.id)
    setForm({
      ...project,
      tags: Array.isArray(project.tags) ? project.tags.join(', ') : project.tags,
    })
    setImagePreview(project.image || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(EMPTY_PROJECT)
    clearImage()
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    const payload = {
      ...form,
      id: form.id || Date.now().toString(),
      tags: typeof form.tags === 'string'
        ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
        : form.tags,
    }
    const updated = editingId
      ? projects.map(p => p.id === editingId ? payload : p)
      : [...projects, payload]

    setSaving(true)
    try {
      await saveProjects(updated, adminKey)
      setProjects(updated)
      setForm(EMPTY_PROJECT)
      clearImage()
      setEditingId(null)
      setMsg(editingId ? 'Project updated.' : 'Project added.')
    } catch (err) {
      setMsg('Error: ' + err.message)
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this project?')) return
    if (editingId === id) cancelEdit()
    setSaving(true)
    try {
      await deleteProject(id, adminKey)
      setProjects(p => p.filter(x => x.id !== id))
      setMsg('Deleted.')
    } catch (err) {
      setMsg('Error: ' + err.message)
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
      setMsg('Updated.')
    } catch (err) {
      setMsg(err.message)
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  if (!authed) {
    const locked = isLocked()
    return (
      <div className={styles.authWrap}>
        <div className={styles.authBox}>
          <p className={styles.label}>// silentlab admin</p>
          <h1 className={styles.authTitle}>Access Required</h1>
          {locked ? (
            <p className={styles.error}>Account locked. Try again in {lockoutRemaining()}s.</p>
          ) : (
            <form onSubmit={handleAuth} className={styles.authForm}>
              <input
                type="password"
                placeholder="Admin key"
                value={adminKey}
                onChange={e => setAdminKey(e.target.value)}
                autoFocus
                autoComplete="current-password"
              />
              <button type="submit" className={styles.btn} disabled={attempts >= MAX_ATTEMPTS}>
                Enter →
              </button>
            </form>
          )}
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

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          {editingId ? `Editing: ${form.name || editingId}` : 'Add Project'}
        </h2>
        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="MineGuardian" />
            </div>
            <div className={styles.field}>
              <label>ID (leave blank to auto-generate)</label>
              <input name="id" value={form.id} onChange={handleChange} placeholder="mineguardian" disabled={!!editingId} />
            </div>
          </div>

          <div className={styles.field}>
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="What does this project do?" rows={3} style={{ resize: 'vertical' }} />
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
              <label>Accent color (CSS gradient or color)</label>
              <input name="accentColor" value={form.accentColor} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.field}>
            <label>Project Image</label>
            <div className={styles.imageArea}>
              {imagePreview ? (
                <div className={styles.imagePreviewWrap}>
                  <img src={imagePreview} alt="preview" className={styles.imagePreview} />
                  <button type="button" className={`${styles.btnSmall} ${styles.danger}`} onClick={clearImage}>
                    remove
                  </button>
                </div>
              ) : (
                <div
                  className={styles.imageDropZone}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={async e => {
                    e.preventDefault()
                    const file = e.dataTransfer.files?.[0]
                    if (file) await handleImagePick({ target: { files: [file] } })
                  }}
                >
                  <span className={styles.imageDropText}>Click or drag an image here</span>
                  <span className={styles.imageDropHint}>PNG, JPG, WEBP · max 1.5 MB</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleImagePick}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className={styles.fieldInline}>
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} id="feat" />
            <label htmlFor="feat">Featured (full-width card)</label>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.btn} disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Save Changes' : '+ Add Project'}
            </button>
            {editingId && (
              <button type="button" className={`${styles.btn} ${styles.btnCancel}`} onClick={cancelEdit} disabled={saving}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Current Projects</h2>
        {loading ? (
          <p className={styles.muted}>Loading...</p>
        ) : projects.length === 0 ? (
          <p className={styles.muted}>No projects yet.</p>
        ) : (
          <div className={styles.list}>
            {projects.map(p => (
              <div key={p.id} className={`${styles.listItem} ${editingId === p.id ? styles.listItemEditing : ''}`}>
                <div className={styles.listInfo}>
                  {p.image && <img src={p.image} alt={p.name} className={styles.listThumb} />}
                  <div className={styles.listMeta}>
                    <div className={styles.listInfoRow}>
                      <span className={styles.listName}>{p.name}</span>
                      <span className={`${styles.badge} ${styles[p.status]}`}>{p.status}</span>
                      {p.featured && <span className={styles.featBadge}>featured</span>}
                    </div>
                    <p className={styles.listDesc}>{p.description}</p>
                  </div>
                </div>
                <div className={styles.listActions}>
                  <button className={styles.btnSmall} onClick={() => startEdit(p)} disabled={saving}>edit</button>
                  <button className={styles.btnSmall} onClick={() => handleToggleFeatured(p.id)} disabled={saving}>
                    {p.featured ? 'unfeature' : 'set featured'}
                  </button>
                  <button className={`${styles.btnSmall} ${styles.danger}`} onClick={() => handleDelete(p.id)} disabled={saving}>
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
