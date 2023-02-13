import {test, expect} from '@playwright/test'

const {describe} = test

test('has title', async ({page}) => {
  await page.goto(process.env.DEV_LOCALHOST ?? '')

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle('Datepicker Sandbox')
})
