import {ExpandRecursively} from './expand'

/**
 * A type representing the object returned after successfully parsing the
 * selector - the 1st argument passed to datepicker.
 */
export type SelectorData = ExpandRecursively<
  {
    /**
     * If the selector is an input, this will be the parent element or, in the
     * case of a Shadow DOM, possibly the associated custom element.
     *
     * If the selector is not an input, then this will be the selector itself.
     * I.e., `containingElement` and `el` will be the same element.
     */
    containingElement: HTMLElement

    /**
     * When Datepicker is associated with an input element, the calendar needs
     * to be positioned relative to that input. In order to accomplish this, the
     * input's parent element needs to be explicitly positioned.
     *
     * If the input's parent element doesn't contain any positioning already,
     * inline styles of `position: relative` will be added to it. This function
     * is a closure that captures all the necessary context in order to safely
     * undo any styling datepicker has applied.
     */
    revertStyling?(): void
  } & (
    | {
        /**
         * Indicates wether the associated selector represents an input element.
         */
        isInput: true

        /**
         * The input element associated with the datepicker calendar.
         */
        el: HTMLInputElement
        revertStyling(): void
      }
    | {
        /**
         * Indicates wether the associated selector represents an input element.
         */
        isInput: false

        /**
         * The element associated with the datepicker calendar. The calendar
         * will be appended to this element in the DOM.
         *
         * For non-input elements, `el` and `containingElement` will be equal.
         */
        el: HTMLElement
      }
  )
>
