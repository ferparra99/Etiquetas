import { LoggerService } from './logger.service';

const isPromise = (value: unknown): value is Promise<unknown> =>
  typeof (value as { then?: unknown } | null)?.then === 'function';

const describe = (error: unknown): string => (error instanceof Error ? error.message : String(error));

/**
 * Patrón Decorator (equivalente al `@LogFeature` + AOP del backend): registra inicio, fin,
 * duración y errores de una funcionalidad sin ensuciar su código. Funciona con métodos síncronos y `async`.
 */
export function LogFeature(feature: string) {
  return (_target: object, _key: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor => {
    const original = descriptor.value as (...args: unknown[]) => unknown;

    descriptor.value = function (this: unknown, ...args: unknown[]): unknown {
      const logger = LoggerService.instance;
      const start = performance.now();
      const elapsed = (): number => Math.round(performance.now() - start);
      logger?.info(feature, 'inicio');
      try {
        const result = original.apply(this, args);
        if (isPromise(result)) {
          return result.then(
            (value) => {
              logger?.info(feature, `fin en ${elapsed()} ms`);
              return value;
            },
            (error: unknown) => {
              logger?.error(feature, `error: ${describe(error)}`);
              throw error;
            },
          );
        }
        logger?.info(feature, `fin en ${elapsed()} ms`);
        return result;
      } catch (error) {
        logger?.error(feature, `error: ${describe(error)}`);
        throw error;
      }
    };
    return descriptor;
  };
}
