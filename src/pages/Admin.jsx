import { useState, useRef } from 'react'
import { useProjects, saveProjects, deleteProject, WORKER_URL } from '../hooks/useProjects.js'
import styles from './Admin.module.css'

const EMPTY_PROJECT = {
  id: '',
  name: '',
  description: '',
  status: 'wip',
  tags: '',
  url: '',
  pingUrl: '',
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
  const [form, setForm] = useState(EMPTY_PROJECT)
  const [editingId, setEditingId] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [pinging, setPinging] = useState({})
  const { projects, loading, setProjects } = useProjects()

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
      pingUrl: project.pingUrl || '',
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

  async function handlePing(id) {
    setPinging(p => ({ ...p, [id]: 'pinging' }))
    try {
      const res = await fetch(`${WORKER_URL}/ping/${id}`, {
        headers: adminKey ? { 'X-Admin-Key': adminKey } : {},
      })
      const data = await res.json()
      setPinging(p => ({ ...p, [id]: data.pingStatus }))
      // Update local project state too
      setProjects(prev => prev.map(p => p.id === id ? { ...p, pingStatus: data.pingStatus } : p))
    } catch {
      setPinging(p => ({ ...p, [id]: 'down' }))
    }
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
              <label>Ping URL (to check uptime)</label>
              <input name="pingUrl" value={form.pingUrl} onChange={handleChange} placeholder="https://api.myproject.com/health" />
            </div>
          </div>

          <div className={styles.field}>
            <label>Accent color (CSS gradient or color)</label>
            <input name="accentColor" value={form.accentColor} onChange={handleChange} />
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
            {projects.map(p => {
              const pingResult = pinging[p.id] || p.pingStatus || 'unknown'
              return (
                <div key={p.id} className={`${styles.listItem} ${editingId === p.id ? styles.listItemEditing : ''}`}>
                  <div className={styles.listInfo}>
                    {p.image && <img src={p.image} alt={p.name} className={styles.listThumb} />}
                    <div className={styles.listMeta}>
                      <div className={styles.listInfoRow}>
                        <span className={styles.listName}>{p.name}</span>
                        <span className={`${styles.badge} ${styles[p.status]}`}>{p.status}</span>
                        {p.featured && <span className={styles.featBadge}>featured</span>}
                        {p.pingUrl && (
                          <span className={`${styles.pingBadge} ${styles['ping_' + pingResult]}`}>
                            <span className={styles.pingDot} />
                            {pingResult === 'pinging' ? 'pinging...' : pingResult}
                          </span>
                        )}
                      </div>
                      <p className={styles.listDesc}>{p.description}</p>
                      {p.pingUrl && (
                        <p className={styles.pingUrl}>⚡ {p.pingUrl}</p>
                      )}
                    </div>
                  </div>
                  <div className={styles.listActions}>
                    <button className={styles.btnSmall} onClick={() => startEdit(p)} disabled={saving}>edit</button>
                    {p.pingUrl && (
                      <button className={styles.btnSmall} onClick={() => handlePing(p.id)} disabled={pingResult === 'pinging'}>
                        ping now
                      </button>
                    )}
                    <button className={styles.btnSmall} onClick={() => handleToggleFeatured(p.id)} disabled={saving}>
                      {p.featured ? 'unfeature' : 'set featured'}
                    </button>
                    <button className={`${styles.btnSmall} ${styles.danger}`} onClick={() => handleDelete(p.id)} disabled={saving}>
                      delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
