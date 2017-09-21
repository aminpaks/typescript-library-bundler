import { isString } from 'lodash-es';
import { HelperFunctionParams } from './types';

export function helperFunction({ value }: HelperFunctionParams): string {
  if (isString(value)) {
    value += ' - isString works';
  }
  return 'HELPER-FUNCTION--' + value;
}

export function anotherHelperFunction(value: any): boolean {
  return { ...value, bool: true };
}
