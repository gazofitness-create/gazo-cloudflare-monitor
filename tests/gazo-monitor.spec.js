const { test, expect } = require('@playwright/test');

const PRODUCT_URL = '/product/sulytarcsa-csomag-30-kg/';

test('Gazo Fitness - homepage to product page Cloudflare test', async ({ page }) => {

  console.log('1. Főoldal megnyitása...');

  await page.goto('/', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  // Főoldalnak be kell töltődnie
  await expect(page).toHaveURL(/gazofitness\.hu/);

  console.log('2. Főoldal betöltve.');

  // Rövid várakozás, hogy az oldal teljesen betöltődjön
  await page.waitForTimeout(3000);

  console.log('3. Termékoldal megnyitása...');

  // Pontosan azt a terméket nyitjuk meg,
  // amelynél korábban jelentkezett a probléma.
  await page.goto(PRODUCT_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  await page.waitForTimeout(5000);

  const currentUrl = page.url();
  const pageTitle = await page.title();
  const bodyText = await page.locator('body').innerText();

  console.log('Aktuális URL:', currentUrl);
  console.log('Oldal címe:', pageTitle);

  // 1. Cloudflare challenge keresése
  const cloudflareDetected =
    bodyText.includes('Please wait while your request is being verified') ||
    bodyText.includes('Verify you are human') ||
    bodyText.includes('Checking your browser') ||
    bodyText.includes('Performing security verification') ||
    bodyText.includes('Just a moment...');

  if (cloudflareDetected) {
    throw new Error(
      '❌ CLOUDFLARE CHALLENGE ÉSZLELVE A TERMÉKOLDALON!'
    );
  }

  // 2. Ellenőrizzük, hogy nem dobott-e vissza a főoldalra
  if (
    currentUrl === 'https://gazofitness.hu/' ||
    currentUrl === 'https://gazofitness.hu'
  ) {
    throw new Error(
      '❌ A TERMÉKOLDAL HELYETT VISSZAKERÜLT A FŐOLDALRA!'
    );
  }

  // 3. Ellenőrizzük, hogy tényleg a megfelelő termékoldalon vagyunk
  if (!currentUrl.includes('/product/sulytarcsa-csomag-30-kg/')) {
    throw new Error(
      `❌ NEM A VÁRT TERMÉKOLDAL TÖLTŐDÖTT BE! URL: ${currentUrl}`
    );
  }

  // 4. Termékoldal tartalmának ellenőrzése
  expect(bodyText.length).toBeGreaterThan(500);

  console.log('================================');
  console.log('✅ TERMÉKOLDAL TESZT SIKERES');
  console.log('URL:', currentUrl);
  console.log('Cím:', pageTitle);
  console.log('================================');
});
