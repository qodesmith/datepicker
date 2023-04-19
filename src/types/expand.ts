/**
 * A utility type to expand types in intellisense when hovering over a type.
 * Brought to you by Matt Pocock - https://twitter.com/mattpocockuk/status/1622730173446557697
 */
type Expander<T> = {
  [K in keyof T]: T[K]
} & {}

/**
 * A utility type to recursively expand types in intellisense when hovering
 * over a type.
 */
type RecursiveExpander<T> = {
  [K in keyof T]: ExpandRecursively<T[K]>
} & {}

/**
 * A utility type to expand function arguments (non-recursively) in intellisense
 * when hovering over a type.
 */
type ExpandFxn<T> = T extends (...args: infer A) => infer R
  ? (...args: Expand<A>) => Expand<R>
  : never

/**
 * A utility type to expand types in intellisense when hovering over a type.
 * We want to ignore some JavaScript objects, such as Date, since this would
 * just clog up intellisense with noise.
 *
 * I still can't get unions to expand. 🤷‍♂️
 */
export type Expand<T> = T extends Function
  ? ExpandFxn<T>
  : T extends Date
  ? T
  : T extends HTMLElement
  ? T
  : unknown extends T
  ? T
  : Expander<T>

/**
 * The recursive version of `Expand<T>`.
 */
export type ExpandRecursively<T> = T extends Function
  ? ExpandFxn<T>
  : T extends Date
  ? T
  : T extends HTMLElement
  ? T
  : unknown extends T
  ? T
  : RecursiveExpander<T>
