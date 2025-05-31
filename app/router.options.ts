// app/router.options.ts
import type { RouterConfig } from '@nuxt/schema';

export default <RouterConfig>{
    scrollBehavior: () => {
        return false; // disable scroll restore completely
    }
};



// export default <RouterConfig>{
//   scrollBehavior(to, from, savedPosition) {
//     if (savedPosition) {
//       return savedPosition;
//     } else {
//       return { top: 0 };
//     }
//   }
// };
