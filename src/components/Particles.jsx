import { useEffect, useRef } from 'react'

export default function Particles() {
    const ref = useRef(null)

    useEffect(() => {
        const container = ref.current
        if (!container) return
        for (let i = 0; i < 25; i++) {
            const pt = document.createElement('div')
            const dur = 8 + Math.random() * 20
            const left = Math.random() * 100
            const drift = (Math.random() - 0.5) * 80
            const size = Math.random() < 0.3 ? 3 : 2
            pt.style.cssText = `
        position:absolute; border-radius:50%; opacity:0;
        left:${left}%; width:${size}px; height:${size}px;
        background:${Math.random() < 0.2 ? '#821bef' : '#00ffcc'};
        animation:ptRise ${dur}s linear infinite;
        animation-delay:-${Math.random() * dur}s;
        --drift:${drift}px;
      `
            container.appendChild(pt)
        }
        return () => { container.innerHTML = '' }
    }, [])

    return <div ref={ref} style={{
        position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden'
    }} />
}