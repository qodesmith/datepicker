/**
 * Returns the type of an item.
 * Examples:
 *    * [object HTMLElement] => HTMLElement
 *    * [object Object] => Object
 *    * [object Array] => Array
 */
export default function getType(item: any): string {
  const type = {}.toString.call(item) as string
  return type.slice(8, -1)
}
