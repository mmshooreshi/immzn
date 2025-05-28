// server/middleware/auth-route.ts
// Import necessary types and functions from your framework or library
import { eventHandler, H3Event } from 'h3';

// Extend the H3Event type to include the route property
interface ExtendedH3Event extends H3Event {
  route?: {
    meta?: {
      requiresAuth?: boolean;
    };
  };
}

// Export the event handler function
export default eventHandler((event: ExtendedH3Event) => {
  if (event.route?.meta?.requiresAuth && !event.context.user) {
    $log.warn('🚫 Unauthenticated request blocked', event.path);
    throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' });
  }

  // Add any additional logic here if needed
});


