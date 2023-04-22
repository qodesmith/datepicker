import {userEvents} from '../constants'
import {DatepickerInstance} from '../types'

/**
 * Data passed to the various user callback functions.
 */
export type CallbackData = {
  /**
   * The explicit source of what triggered the callback. This can be imperative
   * methods, such as `selectDate` and `show` or user interactions with the DOM,
   * such as `click`.
   */
  trigger: Trigger

  /**
   * The category source of what triggered the callback. `user` for user
   * interactions with the DOM, such as `click`, or `imperative` for imperative
   * methods, such as `selectDate` or `show`.
   */
  triggerType: TriggerType

  /**
   * Providing the datepicker instance as a convenience. This allows the user to
   * avoid having to import the instance from wherever it was created.
   */
  instance: DatepickerInstance
}

export type UserEvent = (typeof userEvents)[number]
export type Trigger = ImperativeMethod | UserEvent
export type TriggerType = 'user' | 'imperative'
export type ImperativeMethod =
  | 'selectDate'
  | 'setMin'
  | 'setMax'
  | 'navigate'
  | 'show'
  | 'hide'
