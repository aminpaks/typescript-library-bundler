import { helperFunction } from '../tools';
export class Checker {
  public load: string[];

  constructor() {
    this.load = [];
  }

  private useHelperFunction() {
    const value = helperFunction({ value: 'test' });
    this.load.push(value);
  }

  public getLoads(): string[] {
    return [...this.load];
  }
}
