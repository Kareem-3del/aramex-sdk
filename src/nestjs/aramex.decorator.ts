/**
 * Decorator to inject Aramex SDK
 */

import { Inject } from '@nestjs/common';
import { ARAMEX_SDK } from './aramex.constants';

export const InjectAramex = () => Inject(ARAMEX_SDK);
