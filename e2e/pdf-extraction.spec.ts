import { test, expect } from "@playwright/test";
import path from "path";
import { readFileSync } from "fs";

const TEST_PDF = path.resolve(__dirname, "fixtures/test-court-order.pdf");

// Set test email/password via env: TEST_USER_EMAIL, TEST_USER_PASSWORD
const TEST_EMAIL = process.env.TEST_USER_EMAIL || "";
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || "";

test.describe("PDF Court Order Extraction", () => {
  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      test.skip(
        !TEST_EMAIL,
        "Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run this test"
      );
      return;
    }

    // Log in
    await page.goto("/login");
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    // Wait for redirect to dashboard
    await page.waitForURL("**/dashboard**", { timeout: 15_000 });
  });

  test("uploading an 11-page PDF extracts all pages and shows preview with 100+ blocks", async ({
    page,
  }) => {
    test.setTimeout(120_000); // 2 min for upload + AI extraction
    // Collect console logs for debugging
    const consoleLogs: string[] = [];
    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("[extract-orders]") || text.includes("fullOrderContent")) {
        consoleLogs.push(text);
      }
    });

    // Navigate to modification intake page
    await page.goto("/intake/modification");
    await page.waitForSelector("text=Petition to Modify Court Orders", {
      timeout: 15_000,
    });

    // Step 1: Welcome info step — click "Continue"
    const continueBtn = page.locator('button:has-text("Continue")');
    await expect(continueBtn).toBeVisible({ timeout: 10_000 });
    await continueBtn.click();

    // Step 2: "Would you like to proceed?" — click "Yes"
    const yesBtn = page.locator('button:has-text("Yes")');
    await expect(yesBtn).toBeVisible({ timeout: 5_000 });
    await yesBtn.click();

    // Step 3: File upload step
    const dropZone = page.locator(
      "text=Drag & drop your court order PDF here"
    );
    await expect(dropZone).toBeVisible({ timeout: 10_000 });

    // Upload the test PDF
    const fileInput = page.locator('input[type="file"][accept*="pdf"]');
    await fileInput.setInputFiles(TEST_PDF);

    // Should show "Analyzing..." state
    await expect(
      page.locator("text=Analyzing your court orders")
    ).toBeVisible({ timeout: 5_000 });

    // Wait for extraction to complete (up to 90s for AI processing)
    const viewButton = page.locator("text=View Extracted Document");
    await expect(viewButton).toBeVisible({ timeout: 90_000 });

    // Verify block count in the button text (e.g. "View Extracted Document (171 sections)")
    const buttonText = await viewButton.textContent();
    console.log(`Button text: ${buttonText}`);
    const blockMatch = buttonText?.match(/(\d+)\s*sections/);
    const blockCount = blockMatch ? parseInt(blockMatch[1], 10) : 0;
    console.log(`Block count from button: ${blockCount}`);

    expect(blockCount).toBeGreaterThan(100);

    // Dialog auto-opens on successful extraction — check if already visible
    const dialog = page.locator('[role="dialog"]');
    if (!(await dialog.isVisible().catch(() => false))) {
      await viewButton.click();
    }
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // Verify dialog title
    await expect(
      dialog.locator("text=Extracted Court Order")
    ).toBeVisible();

    // Verify all 11 page headers exist
    for (let pageNum = 1; pageNum <= 11; pageNum++) {
      await expect(
        dialog.locator(`text=Page ${pageNum}`).first()
      ).toBeVisible({ timeout: 3_000 });
    }

    // Spot-check content from various pages
    await expect(
      dialog.locator("text=IN THE SUPERIOR COURT OF THE STATE OF ARIZONA")
    ).toBeVisible();
    await expect(
      dialog.locator("text=FC-2014-003563").first()
    ).toBeVisible();
    await expect(
      dialog.locator("text=HOLIDAY SCHEDULE").first()
    ).toBeVisible();
    await expect(
      dialog.locator("text=CHILD SUPPORT").first()
    ).toBeVisible();
    await expect(
      dialog.locator("text=HON. JOSEPH C. WELTY").first()
    ).toBeVisible();
    await expect(
      dialog.locator("text=CERTIFICATE OF SERVICE").first()
    ).toBeVisible();

    // Verify footer stats
    const footer = dialog.locator("text=text blocks across");
    await expect(footer).toBeVisible();
    const footerText = await footer.textContent();
    console.log(`Footer: ${footerText}`);

    const footerMatch = footerText?.match(
      /(\d+)\s*text blocks across\s*(\d+)\s*pages/
    );
    expect(footerMatch).toBeTruthy();
    const totalBlocks = parseInt(footerMatch![1], 10);
    const totalPages = parseInt(footerMatch![2], 10);

    expect(totalBlocks).toBeGreaterThan(100);
    expect(totalPages).toBe(11);

    // Print collected logs
    if (consoleLogs.length > 0) {
      console.log("\n--- Browser console (extraction debug) ---");
      consoleLogs.forEach((log) => console.log(`  ${log}`));
    }

    // Close dialog (use first Close button — the text one, not the X icon)
    await dialog.locator('button:has-text("Close")').first().click();
    await expect(dialog).not.toBeVisible();

    console.log(
      `\n✅ PASS: ${totalBlocks} blocks across ${totalPages} pages`
    );
  });

  test("extraction API returns correct debug stats", async ({ request }) => {
    // Direct API test — upload the PDF and check the response
    // This test requires auth cookies, so it may only work after browser login
    test.skip(
      !TEST_EMAIL,
      "Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run this test"
    );

    const pdfBuffer = readFileSync(TEST_PDF);

    const response = await request.post("/api/intake/extract-orders", {
      multipart: {
        file: {
          name: "test-court-order.pdf",
          mimeType: "application/pdf",
          buffer: pdfBuffer,
        },
      },
    });

    // API test context doesn't share browser cookies — 401 is expected
    if (response.status() === 401) {
      console.log("API returned 401 — expected (auth cookies not shared with API context). Skipping.");
      test.skip(true, "API context lacks auth cookies");
      return;
    }

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    console.log("API _debug:", data._debug);
    console.log("extractedData keys:", Object.keys(data.extractedData || {}));
    console.log(
      "fullOrderContent count:",
      data.extractedData?.fullOrderContent?.length
    );

    // Verify extraction quality
    expect(data.extractedData).toBeTruthy();
    expect(data.extractedData.fullOrderContent).toBeTruthy();
    expect(data.extractedData.fullOrderContent.length).toBeGreaterThan(100);

    // Verify debug stats
    if (data._debug) {
      expect(data._debug.totalPages).toBe(11);
      expect(data._debug.totalBlocks).toBeGreaterThan(100);
      expect(data._debug.totalChars).toBeGreaterThan(5000);
    }

    // Verify metadata extraction
    expect(data.extractedData.caseNumber).toContain("FC-2014");
    expect(data.extractedData.petitionerName).toContain("Elder");
    expect(data.extractedData.respondentName).toContain("Elder");

    console.log(
      `\n✅ API PASS: ${data.extractedData.fullOrderContent.length} blocks, ` +
        `${data._debug?.totalPages} pages`
    );
  });
});
