// ~/plugins/debug-pane.client.ts
import {
    defineNuxtPlugin,
    useRouter,
    useState,
    watch,
    usePinia,
    useNuxtApp
} from '#imports'

export default defineNuxtPlugin(() => {
    if (process.env.NODE_ENV !== 'test') return

    /* ——————————————————————— internal stores ——————————————————————— */
    const dbg = useState<Record<string, unknown>>('__DBG__', () => ({}))

    const hidden = useState<Record<string, Set<string>>>('__DBG_HIDDEN__', () => ({}))
    const routeKey = () => window.location.pathname
    const pinia = usePinia()

    /* ——————————— helper to hide a key only on this page ——————————— */
    const hide = (k: string) => {
        const key = routeKey()
        hidden.value[key] ||= new Set()
        hidden.value[key].add(k)
        persist()
        render()
    }

    /* ———————————————————  persist hidden keys (session) ————————————————— */
    const persist = () =>
        sessionStorage.setItem(
            '__DBG_HIDDEN__',
            JSON.stringify(
                Object.fromEntries(
                    Object.entries(hidden.value).map(([k, set]) => [k, [...set]])
                )
            )
        )
        ; (() => {
            try {
                const obj = JSON.parse(sessionStorage.getItem('__DBG_HIDDEN__') || '{}')
                Object.entries(obj as Record<string, string[]>).forEach(
                    ([k, arr]) => (hidden.value[k] = new Set(arr))
                )
            } catch { }
        })()

    /* ——————————————— global manual export still works ——————————————— */
    useNuxtApp().$debug = (k: string, v: any) => (dbg.value[k] = v)

    /* ————————————————————  overlay element ———————————————————————— */
    const pane = document.createElement('div')
    Object.assign(pane.style, {
        position: 'fixed',
        top: '0',
        right: '0',
        maxHeight: '100vh',
        overflow: 'auto',
        background: '#121212cc', // 0.8 opacity
        color: '#fff',
        font: '12px/1.4 monospace',
        zIndex: '99999',
        minWidth: '260px',
        padding: '6px 8px',
        borderBottomLeftRadius: '6px',
        cursor: 'default',
        userSelect: 'text',
        transition: 'all .2s'
    } as CSSStyleDeclaration)
    document.body.appendChild(pane)

    let visible = true
    let fullscreen = false

    /* ———————————————————  keyboard shortcuts ———————————————————— */
    let lastSpace = 0
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            const now = performance.now()
            if (now - lastSpace < 350) toggleVisibility()
            lastSpace = now
        }
    })

    /* ——————————— double-click toggles fullscreen inside pane ————————— */
    pane.ondblclick = () => {
        fullscreen = !fullscreen
        if (fullscreen) {
            Object.assign(pane.style, {
                top: '0',
                right: '0',
                bottom: '0',
                background: '#121212cc',
                left: '0',
                width: '100vw',
                height: '100vh',
                maxHeight: '100vh',
                borderRadius: '0',
                fontSize: '14px'
            })
        } else {
            Object.assign(pane.style, {
                top: '0',
                right: '0',
                width: '',
                height: 'max-content',
                background: '#121212cc',
                borderBottomLeftRadius: '6px',
                fontSize: '12px'
            })
        }
    }

    function toggleVisibility() {
        visible = !visible
        pane.style.display = visible ? 'block' : 'none'
    }

    /* ————————————————— gather data on every change ———————————————— */
    const gather = () => {
        const nuxt = useNuxtApp()
        const { currentRoute } = useRouter()

        dbg.value['$route'] = {
            path: currentRoute.value.fullPath,
            params: currentRoute.value.params,
            query: currentRoute.value.query
        }

        const nuxtState = (nuxt as any)._nuxtState ?? {}
        Object.entries(nuxtState).forEach(([k, v]) => (dbg.value[`state:${k}`] = v))

        const stores = ((pinia as any)?._s ?? new Map()) as Map<any, any>
        stores.forEach((store, key) => (dbg.value[`store:${key}`] = store.$state))
    }

    const render = () => {
        const omit = hidden.value[routeKey()] || new Set()
        pane.innerHTML = Object.entries(dbg.value)
            .filter(([k]) => !omit.has(k))
            .map(
                ([k, v]) =>
                    `<div style="margin-bottom:2px">
             <button data-k="${k}"
               style="background:#f43;border:0;color:#fff;font-size:9px;
                      cursor:pointer;margin-right:4px;width:16px;height:16px;">–</button>
             <b>${k}</b>: ${safe(v)}
           </div>`
            )
            .join('')
    }

    pane.addEventListener('click', (e) => {
        const btn = (e.target as HTMLElement).closest('button[data-k]') as
            | HTMLElement
            | null
        if (btn?.dataset?.k) hide(btn.dataset.k)
    })

    function safe(val: unknown) {
        try {
            const str = JSON.stringify(val)
            return str.length > 200 ? str.slice(0, 197) + '…' : str
        } catch {
            return String(val)
        }
    }

    /* ——————————— initial & reactive updates ——————————— */
    gather()
    render()
    watch(useRouter().currentRoute, () => {
        gather()
        render()
    })
    if ((useNuxtApp() as any)._nuxtState)
        watch((useNuxtApp() as any)._nuxtState, () => {
            gather()
            render()
        }, { deep: true })
    if ((pinia as any).state)
        watch((pinia as any).state, () => {
            gather()
            render()
        }, { deep: true })
})
