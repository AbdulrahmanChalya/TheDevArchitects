import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_ROUTE = 'isPublicRoute';

/** Exempts a controller or route from the global Firebase authentication guard. */
export const Public = () => SetMetadata(IS_PUBLIC_ROUTE, true);
