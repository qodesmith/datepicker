import {atom, atomFamily} from 'recoil'
import {DatepickerInstance, DaterangePickerInstance} from '../src/types'
import oldDatepicker from '../src/old-datepicker'

export const sliderAtomFamily = atomFamily<
  number,
  {sliderKey: string; initialValue: number}
>({
  key: 'sliderAtomFamily',
  default: ({initialValue}) => initialValue,
})

/**
 * Possible to have atomFamily with generic data types?
 * https://github.com/facebookexperimental/Recoil/discussions/1148
 */
export const datepickerAtomFamily = atomFamily<
  DatepickerInstance | DaterangePickerInstance | null,
  string
>({
  key: 'datepickerAtomFamily',
  default: null,
})

export const oldDatepickerAtom = atom<ReturnType<typeof oldDatepicker> | null>({
  key: 'oldDatepickerAtom',
  default: null,

  /**
   * The old datepicker removes all properties on the picker object when calling
   * `picker.remove()`. This clashes with the fact that Recoil freezes all
   * objects stored in state. This property is the escape hatch. It's fine to
   * use this for the old datepicker because we remove it while simultaneously
   * setting the Recoil atom to null.
   *
   * https://github.com/facebookexperimental/Recoil/issues/406#issuecomment-650364700
   */
  dangerouslyAllowMutability: true,
})
