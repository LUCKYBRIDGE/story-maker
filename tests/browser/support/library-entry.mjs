// Enter through the visible application home, respecting first/repeat visits.
export async function openLibrary(page) {
  await page.locator('.nolstory-poster-frame, .library-shelf, .creator-shell').first().waitFor();
  if (await page.locator('.creator-shell').isVisible()) await page.getByRole('button', {name:'서재로', exact:true}).click();
  if (await page.locator('.nolstory-poster-frame').isVisible()) await page.getByRole('button', {name:'서재 입장', exact:true}).click();
  await page.locator('.library-shelf').waitFor();
}
export async function selectLocalBook(page) {
  await openLibrary(page);
  await page.getByRole('button',{name:'내 작품',exact:true}).click();
  await page.locator('.library-book:not(.library-book-new)').first().click();
  await page.getByRole('button',{name:'이어만들기',exact:true}).waitFor();
}
export async function openManagement(page) {
  await openLibrary(page);
  await page.getByRole('button',{name:'창작 관리',exact:true}).click();
  await page.getByRole('heading',{name:'창작 관리',exact:true}).waitFor();
}
