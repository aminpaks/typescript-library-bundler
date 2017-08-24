import { HelperFunctionParams } from './types';

export function helperFunction({ value }: HelperFunctionParams): string {
  return 'HELPER-FUNCTION--' + value;
}

export function anotherHelperFunction(value: any): boolean {
  return { ...value, bool: true };
}
