// composables/useSplitTextSequence.ts
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
// import { Ref } from 'vue'

gsap.registerPlugin(SplitText)

type SplitType = 'chars' | 'words' | 'lines'

interface SequenceOptions {
  selector?: string               // which elements to sequence
  type?: SplitType                // split type
  containerVars?: gsap.TweenVars  // how each container comes in
  fromVars?: gsap.TweenVars       // how each split-child comes in
  elementDelay?: number           // pause (in seconds) between each element
}

export function useSplitTextSequence(
  rootEl: Ref<HTMLElement | null>,
  options: SequenceOptions = {}
) {
  const {
    selector = '.sequence-item',
    type     = 'words',
    containerVars = { opacity: 0, y: 30, duration: 0.6, ease: 'power2.out' },
    fromVars      = { opacity: 0, y: 20, stagger: 0.1, duration: 0.5, ease: 'power2.out' },
    elementDelay  = 0.5,
  } = options

  let tl: gsap.core.Timeline

  const animate = () => {
    if (!rootEl.value) return
    // grab all children you want to animate, in DOM order
    const items = Array.from(rootEl.value.querySelectorAll<HTMLElement>(selector))
    if (!items.length) return

    tl = gsap.timeline()
    items.forEach(el => {
      // 1) container animation
      tl.from(el, containerVars)
      // 2) split & child animation
      const split = new SplitText(el, { type })
      const targets = (split as any)[type] as HTMLElement[]
      if (targets) {
        tl.from(targets, fromVars)
      }
      // 3) clean up (optional)
      tl.add(() => split.revert())
      // 4) pause before next element
      tl.to({}, { duration: elementDelay })
    })
  }

  const cleanup = () => {
    tl?.kill()
  }

  return { animate, cleanup }
}
