import styles from './ProjectCard.module.css'

const STATUS_CONFIG = {
    live: { label: 'Live',           color: 'var(--green)', dotClass: 'live' },
    wip:  { label: 'In development', color: '#ffaa00',      dotClass: 'wip'  },
    soon: { label: 'Soon',           color: 'var(--muted)', dotClass: 'soon' },
}

function PingIndicator({ pingStatus, pingUrl }) {
    if (!pingUrl) return null
    const map = {
        up:      { label: 'Online',  cls: styles.pingUp },
        down:    { label: 'Offline', cls: styles.pingDown },
        unknown: { label: 'Status unknown', cls: styles.pingUnknown },
    }
    const { label, cls } = map[pingStatus] || map.unknown
    return (
        <span className={`${styles.pingPill} ${cls}`}>
            <span className={styles.pingDot} />
            {label}
        </span>
    )
}

export default function ProjectCard({ project, featured = false }) {
    const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.soon

    const inner = (
        <>
            {featured ? (
                <img className={styles.featuredImg} src={project.image || ''} alt={project.name}
                     onError={e => { e.target.style.display = 'none' }} />
            ) : (
                <div className={styles.imgBox}>
                    {project.image
                        ? <img src={project.image} alt={project.name} className={styles.cardImg}
                               onError={e => { e.target.style.display = 'none' }} />
                        : <span className={styles.classified}>CLASSIFIED</span>
                    }
                </div>
            )}
            <div className={`${styles.body} ${featured ? styles.featuredBody : ''}`}>
                <div className={styles.statusRow}>
                    <div className={styles.status} style={{ color: status.color }}>
                        <span className={`${styles.dot} ${styles[status.dotClass]}`} />
                        {status.label}
                    </div>
                    <PingIndicator pingStatus={project.pingStatus} pingUrl={project.pingUrl} />
                </div>
                <div className={styles.accent} style={{
                    background: project.accentColor || 'linear-gradient(90deg, var(--cyan), var(--purple))'
                }} />
                <h3 className={styles.name}>{project.name}</h3>
                <p className={styles.desc}>{project.description}</p>
                <div className={styles.tags}>
                    {(project.tags || []).map(tag => (
                        <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                </div>
                {project.url && (
                    <span className={styles.link} style={{ color: status.color }}>
                        {project.status === 'live' ? 'Open →' : 'Coming soon →'}
                    </span>
                )}
            </div>
        </>
    )

    const cls = `${styles.card} ${featured ? styles.featured : ''}`
    return project.url && project.status === 'live'
        ? <a href={project.url} target="_blank" rel="noopener" className={cls}>{inner}</a>
        : <div className={cls}>{inner}</div>
}
