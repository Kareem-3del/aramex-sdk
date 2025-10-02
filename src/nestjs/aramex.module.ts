/**
 * NestJS Module for Aramex SDK
 */

import { DynamicModule, Module, Provider } from '@nestjs/common';
import { AramexSDK } from '../aramex-sdk';
import { AramexConfig } from '../types';
import { ARAMEX_CONFIG, ARAMEX_SDK } from './aramex.constants';

export interface AramexModuleOptions extends AramexConfig {}

export interface AramexModuleAsyncOptions {
  useFactory: (...args: any[]) => Promise<AramexConfig> | AramexConfig;
  inject?: any[];
}

@Module({})
export class AramexModule {
  /**
   * Register module synchronously
   * @param options Aramex configuration
   * @returns Dynamic module
   */
  static forRoot(options: AramexModuleOptions): DynamicModule {
    const configProvider: Provider = {
      provide: ARAMEX_CONFIG,
      useValue: options,
    };

    const sdkProvider: Provider = {
      provide: ARAMEX_SDK,
      useFactory: (config: AramexConfig) => {
        return new AramexSDK(config);
      },
      inject: [ARAMEX_CONFIG],
    };

    return {
      module: AramexModule,
      providers: [configProvider, sdkProvider],
      exports: [ARAMEX_SDK],
      global: true,
    };
  }

  /**
   * Register module asynchronously
   * @param options Async configuration options
   * @returns Dynamic module
   */
  static forRootAsync(options: AramexModuleAsyncOptions): DynamicModule {
    const configProvider: Provider = {
      provide: ARAMEX_CONFIG,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    const sdkProvider: Provider = {
      provide: ARAMEX_SDK,
      useFactory: (config: AramexConfig) => {
        return new AramexSDK(config);
      },
      inject: [ARAMEX_CONFIG],
    };

    return {
      module: AramexModule,
      providers: [configProvider, sdkProvider],
      exports: [ARAMEX_SDK],
      global: true,
    };
  }
}
