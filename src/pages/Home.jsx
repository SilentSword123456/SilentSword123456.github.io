import { useEffect, useRef } from 'react'
import Particles from '../components/Particles.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import { useProjects } from '../hooks/useProjects.js'
import styles from './Home.module.css'
import wolfLogo from '../assets/logo_nobg.png'

export default function Home() {
  const { projects, loading } = useProjects()
  const cardsRef = useRef([])

  // Scroll-triggered fade-in for cards
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add(styles.visible)
      }),
      { threshold: 0.1 }
    )
    cardsRef.current.forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  }, [projects])

  const featured = projects.find(p => p.featured)
  const rest = projects.filter(p => !p.featured)

  return (
    <>
      <Particles />

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />

        <div className={`${styles.logoWrap} ${styles.fadeIn1}`}>
          <img src={wolfLogo} alt="SilentLab" className={styles.logo} />
        </div>

        <p className={`${styles.heroTag} ${styles.fadeIn2}`}>// est. 2024 · Romania</p>

        <h1 className={`${styles.heroTitle} ${styles.fadeIn3}`}>SilentLab</h1>

        <p className={`${styles.heroSub} ${styles.fadeIn4}`}>
          Building <span>minimal</span>, high-quality digital tools.<br />
          Quietly. Precisely. For real.
        </p>

        <div className={styles.scrollHint}>
          <span>scroll</span>
          <div className={styles.scrollArrow} />
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section className={styles.projects}>
        <p className={styles.sectionLabel}>// projects</p>
        <h2 className={styles.sectionTitle}>What we <em>ship</em></h2>

        {loading ? (
          <p className={styles.loading}>fetching projects...</p>
        ) : (
          <div className={styles.grid}>
            {featured && (
              <div ref={el => cardsRef.current[0] = el} className={styles.cardWrap}>
                <ProjectCard project={featured} featured />
              </div>
            )}
            {rest.map((p, i) => (
              <div
                key={p.id}
                ref={el => cardsRef.current[i + 1] = el}
                className={styles.cardWrap}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <ProjectCard project={p} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <p>
          © 2026 <a href="/">SilentLab</a> · Built by{' '}
          <a href="https://github.com/SilentSword123456" target="_blank" rel="noopener">
            SilentSword
          </a>{' '}
          · Romania
        </p>
      </footer>
    </>
  )
}
