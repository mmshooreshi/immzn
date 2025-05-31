<!-- @/components/BaseNavbarEnhanced.vue -->
<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { PropType } from 'vue'
import BaseIconButton from '~/components/BaseIconButton.vue'
import { useSettings } from '~/composables/useSettings'
// import { useIsMobile, useScrollTo } from '~/composables'
import { useAuth } from '~/stores/auth'
import Emitter from '~~/utils/emitter'

export type Lang = 'en' | 'fa'

interface MenuItem {
    slug: string
    name: string | Record<string, string>
}

/* ────────────────────────────────
 * Props / Emits
 * ────────────────────────────────*/
const props = defineProps({
    items: {
        type: Array as PropType<MenuItem[]>,
        required: true,
    },
    lang: {
        type: String as PropType<Lang>,
        required: true,
    },
})

const emit = defineEmits<{
    (e: 'request-lang', lang: Lang): void
}>()

/* ────────────────────────────────
 * State / Composables
 * ────────────────────────────────*/
const router = useRouter()
const route = useRoute()
const scroll = useScrollTo()
const isMobile = useIsMobile()

const menuOpen = ref(false)
const auth = useAuth()

const { theme, toggleTheme, toastShow, toggleToast } = useSettings()

const OFFSET = -100

/* ────────────────────────────────
 * Helpers
 * ────────────────────────────────*/
const itemName = (item: MenuItem) =>
    typeof item.name === 'object'
        ? item.name[props.lang] ?? item.name.en ?? ''
        : item.name

const isButton = (item: MenuItem) => item.slug !== 'login'


// const loco = inject<LocomotiveScroll | null>('scroll')   // provided in layout

// async function goTo(id: string) {
//     // 1️⃣  make sure we are on the home page
//     if (router.currentRoute.value.path !== '/') {
//         await router.push({ path: '/', hash: `#${id}` })
//     } else {
//         router.replace({ hash: `#${id}` })           // update address bar
//     }

//     // 2️⃣  after the DOM is rendered, ask Locomotive to scroll
//     nextTick(() => loco?.value.scrollTo(`#${id}`, { duration: 800 }))
// }

async function goTo(id: string) {
    if (router.currentRoute.value.path !== '/') {
        await router.push({ path: '/', hash: `#${id}` })
    } else {
        await router.push({ path: '/', hash: `#${id}` })
    }
}



function navigateTo(target: string) {
    // Same page scroll
    if (route.path === '/') {
        // Prefer composable scroll if available
        scroll.value?.scrollTo(target, { duration: 800, offset: OFFSET }) ??
            document.querySelector<HTMLElement>(target)?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            })
    }
    // Different page – emit and push
    else {
        Emitter.emit('route-change', `/${target}`)
        router.push('/')
    }

    menuOpen.value = false
}

function handleItem(item: MenuItem) {
    // if (isButton(item)) navigateTo(`#${item.slug}`)
    if (isButton(item)) goTo(item.slug)


}

function toggleLang() {
    menuOpen.value = false
    emit('request-lang', props.lang === 'en' ? 'fa' : 'en')
}

onBeforeUnmount(() => {
    menuOpen.value = false
})
</script>

<template>
    <header v-motion-fade-visible-once data-scroll data-scroll-sticky data-scroll-target="main"
        class="fixed top-4 left-[10px] right-[10px] w-[95%] mx-auto rounded-2xl bg-black/50 dark:bg-white/5 backdrop-blur-2xl z-50">
        <!-- ╭───────────────╮ -->
        <!-- │   NAV BAR    │ -->
        <!-- ╰───────────────╯ -->
        <nav class="flex items-center justify-between px-4 py-3">
            <!-- Brand ------------------------------------------------------------ -->
            <button v-if="!isMobile" @click="router.push('/')" class="font-bold text-nowrap h-6 px-2">
                <span v-if="lang === 'en'">Imm<span class="text-purple-200">Unity</span> Horizons</span>
                <span v-else>گستره‌ی<span class="text-purple-200"> ایمنی</span></span>
            </button>

            <!-- Desktop Menu ----------------------------------------------------- -->
            <ul v-if="!isMobile" class="flex gap-3 items-center">
                <li v-for="item in props.items" :key="item.slug" :role="isButton(item) ? 'button' : undefined"
                    class="px-2 py-2 rounded-xl text-xs hover:bg-gray-200/30 transition-colors select-none cursor-pointer"
                    @click="handleItem(item)">
                    <!-- Regular items -->
                    <template v-if="isButton(item)">
                        {{ itemName(item) }}
                    </template>

                    <!-- Login / Profile -->
                    <template v-else>
                        <NuxtLink :to="auth.user ? '/profile' : `/${item.slug}`" class="block w-full h-full">
                            {{ auth.user ? (lang === 'fa' ? 'پروفایل' : 'Profile') : itemName(item) }}
                        </NuxtLink>
                    </template>
                </li>
            </ul>

            <!-- Utilities (language, theme, hamburger) --------------------------- -->
            <div class="flex items-center gap-2 w-full md:w-auto">
                <!-- Language -->
                <BaseIconButton :label="`Switch language (current: ${lang.toUpperCase()})`" @click="toggleLang">
                    {{ lang === 'fa' ? 'فا' : lang.toUpperCase() }}
                </BaseIconButton>

                <!-- Theme -->
                <BaseIconButton :label="`Switch theme (current: ${theme})`" @click="toggleTheme">
                    <Icon :name="theme === 'light' ? 'material-symbols:light-mode' : 'material-symbols:dark-mode'"
                        class="w-6 h-6" />
                </BaseIconButton>
                <div class="flex-grow"></div>

                <!-- Hamburger -->
                <BaseIconButton v-if="isMobile" class="hamburger" :label="menuOpen ? 'Close menu' : 'Open menu'"
                    @click="menuOpen = !menuOpen">
                    <span :class="{ open: menuOpen }"></span>
                    <span :class="{ open: menuOpen }"></span>
                    <span :class="{ open: menuOpen }"></span>
                </BaseIconButton>
            </div>
        </nav>

        <!-- Mobile Menu -------------------------------------------------------- -->
        <teleport to="body">
            <transition name="slide-fade">
                <ul v-if="menuOpen && isMobile" :key="props.lang"
                    class="menno fixed top-24 right-4 min-w-[150px] rounded-3xl p-4 flex flex-col gap-2 bg-black/30 backdrop-blur-md z-[1000]">
                    <li v-for="item in props.items" :key="item.slug" :role="isButton(item) ? 'button' : undefined"
                        class="text-lg font-bold hover:bg-gray-200/10 rounded-xl px-3 py-1 cursor-pointer active:scale-95 transition-transform"
                        @click="handleItem(item)">
                        <!-- Regular items -->
                        <template v-if="isButton(item)">{{ itemName(item) }}</template>

                        <!-- Login / Profile -->
                        <template v-else>
                            <NuxtLink @click="menuOpen = false" :to="auth.user ? '/profile' : `/${item.slug}`">
                                {{ auth.user ? (lang === 'fa' ? 'پروفایل' : 'Profile') : itemName(item) }}
                            </NuxtLink>
                        </template>
                    </li>

                    <!-- Toast toggle & logout (mobile) -->
                </ul>
            </transition>
        </teleport>
    </header>
</template>

<style scoped lang="scss">
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: opacity 0.3s, transform 0.3s;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.hamburger {

    display: flex;
    flex-direction: column;
    gap: 4px;
    cursor: pointer;

    span {

        display: block;
        width: 24px;
        height: 4px;
        background: white;
        border-radius: 2px;
        transition: all 0.3s ease;

        &.open:nth-child(1) {
            transform: rotate(45deg) translateY(5px) translateX(6px);

        }

        &.open:nth-child(2) {
            opacity: 0;
        }

        &.open:nth-child(3) {
            transform: rotate(-45deg) translateY(-5px) translateX(6px);
        }
    }
}
</style>
