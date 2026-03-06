import { test, expect, Page } from "@playwright/test";
import path from "path";

const TEST_PDF = path.resolve(__dirname, "fixtures/test-court-order.pdf");
const TEST_EMAIL = process.env.TEST_USER_EMAIL || "";
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || "";

// Scope interactive elements to the chat input area (excludes reference panel & old messages)
const INPUT = '[data-testid="chat-input-area"]';

async function answerCurrentQuestion(page: Page): Promise<string> {
  await page.waitForTimeout(800);

  if (page.url().includes("/cases/")) return "redirected";

  // Check completion state
  const completeArea = page.locator('[data-testid="chat-complete"]');
  if (await completeArea.isVisible().catch(() => false)) {
    // Click "Generate Documents" to proceed
    const genBtn = completeArea.locator('button:has-text("Generate")').first();
    if (await genBtn.isVisible().catch(() => false)) {
      await genBtn.click();
      return "generate";
    }
    return "complete";
  }

  // All interactive element checks scoped to the input area
  const inputArea = page.locator(INPUT);
  if (!(await inputArea.isVisible().catch(() => false))) return "unknown";

  const inputText = await inputArea.textContent().catch(() => "") || "";

  // Continue button (info steps + multiselect submit)
  const continueBtn = inputArea.locator('button:has-text("Continue")').first();
  if (await continueBtn.isVisible().catch(() => false)) {
    // If this is a multiselect Continue, check if any option is selected first
    const checkbox = inputArea.locator('[role="checkbox"][data-state="checked"]').first();
    if (await checkbox.isVisible().catch(() => false)) {
      // Already has selection, click Continue to submit
      await continueBtn.click();
      return "multiselect-submit";
    }
    // Check if it's disabled (multiselect with no selection yet)
    const isDisabled = await continueBtn.isDisabled().catch(() => false);
    if (isDisabled) {
      // Need to select an option first — fall through to multiselect handling
    } else {
      await continueBtn.click();
      return "continue";
    }
  }

  // Yes/No buttons — check the full chat context for "No" triggers
  const yesBtn = inputArea.locator('button:has-text("Yes")').first();
  if (await yesBtn.isVisible().catch(() => false)) {
    const noBtn = inputArea.locator('button:has-text("No")').first();
    // Read the last message in the chat area to understand the question context
    const chatMessages = page.locator('main [class*="rounded-2xl"]');
    const lastMsg = await chatMessages.last().textContent().catch(() => "") || "";
    const fullContext = lastMsg + " " + inputText;
    if (await noBtn.isVisible().catch(() => false)) {
      if (fullContext.includes("another child") || fullContext.includes("supervised")) {
        await noBtn.click();
        return "no";
      }
    }
    await yesBtn.click();
    return "yes";
  }

  // Role selection (single-select buttons)
  const petitionerBtn = inputArea.locator('button:has-text("I am the Petitioner")').first();
  if (await petitionerBtn.isVisible().catch(() => false)) {
    await petitionerBtn.click();
    return "role=petitioner";
  }

  // Multiselect — click labels (not buttons, since these are checkbox labels)
  const ldmLabel = inputArea.locator('label:has-text("Legal Decision Making")').first();
  if (await ldmLabel.isVisible().catch(() => false)) {
    await ldmLabel.click();
    await page.waitForTimeout(300);
    // Now click the Continue/Submit button
    const sub = inputArea.locator('button:has-text("Continue"), button:has-text("Submit")').first();
    if (await sub.isVisible().catch(() => false)) await sub.click();
    return "modifications=ldm";
  }

  // Single-select option buttons (court, page, paragraph, etc.)
  const maricopaBtn = inputArea.locator('button:has-text("Maricopa")').first();
  if (await maricopaBtn.isVisible().catch(() => false)) {
    await maricopaBtn.click();
    return "court=maricopa";
  }

  const page1Btn = inputArea.locator('button:has-text("Page 1")').first();
  if (await page1Btn.isVisible().catch(() => false)) {
    await page1Btn.click();
    return "page=1";
  }

  const paragraphBtn = inputArea.locator('button:has-text("Paragraph A")').first();
  if (await paragraphBtn.isVisible().catch(() => false)) {
    await paragraphBtn.click();
    return "paragraph=A";
  }

  const soleLegalBtn = inputArea.locator('button:has-text("Sole legal")').first();
  if (await soleLegalBtn.isVisible().catch(() => false)) {
    await soleLegalBtn.click();
    return "ldm_type=sole";
  }

  const scheduleBtn = inputArea.locator('button:has-text("5-2-2-5")').first();
  if (await scheduleBtn.isVisible().catch(() => false)) {
    await scheduleBtn.click();
    return "schedule=5225";
  }

  // Textarea
  const textarea = inputArea.locator('textarea:visible').first();
  if (await textarea.isVisible().catch(() => false)) {
    if (!(await textarea.inputValue())) {
      await textarea.fill("Circumstances have substantially changed since the original order.");
    }
    // Submit button is Send icon — find it by being the gradient button
    const sendBtn = inputArea.locator('button.bg-gradient-to-r, button:has(svg.lucide-send)').first();
    if (await sendBtn.isVisible().catch(() => false)) await sendBtn.click();
    return "textarea";
  }

  // Date input — uses Calendar popover (button trigger showing "Select date..." or current date)
  const dateBtn = inputArea.locator('button:has-text("Select date"), button:has-text("January"), button:has-text("February"), button:has-text("March"), button:has-text("April"), button:has-text("May"), button:has-text("June"), button:has-text("July"), button:has-text("August"), button:has-text("September"), button:has-text("October"), button:has-text("November"), button:has-text("December")').first();
  if (await dateBtn.isVisible().catch(() => false)) {
    const btnText = await dateBtn.textContent() || "";
    if (btnText.includes("Select date")) {
      // Open calendar and select a date
      await dateBtn.click();
      await page.waitForTimeout(500);
      // Click a day in the calendar
      const dayBtn = page.locator('[role="gridcell"] button:not([disabled])').first();
      if (await dayBtn.isVisible().catch(() => false)) {
        await dayBtn.click();
        await page.waitForTimeout(300);
      }
    }
    // Click the Send button next to date
    const sendBtn = inputArea.locator('button:has(svg)').last();
    if (await sendBtn.isVisible().catch(() => false)) await sendBtn.click();
    return "date";
  }

  // Text input (address, case number, etc.)
  // Note: Submit button is an icon-only Send button, so use Enter to submit
  const textInput = inputArea.locator('input[type="text"]:visible').first();
  if (await textInput.isVisible().catch(() => false)) {
    const currentVal = await textInput.inputValue();
    const placeholder = await textInput.getAttribute("placeholder") || "";
    const needsFill = !currentVal || currentVal === "Test Answer";
    if (needsFill) {
      // Detect field type by placeholder text
      if (placeholder.includes("Main Street") || placeholder.includes("address") || inputText.toLowerCase().includes("address"))
        await textInput.fill("123 Main St, Phoenix, AZ 85001");
      else if (placeholder.toLowerCase().includes("case") || inputText.includes("case number"))
        await textInput.fill("FC-2014-003563");
      else if (placeholder.includes("Search"))
        // Search filter in select — skip it
        return "search-skip";
      else
        await textInput.fill("Test Answer");
    }
    await textInput.press("Enter");
    return `text(ph="${placeholder.slice(0, 25)}")`;
  }

  // Generic submit/next button
  const submitBtn = inputArea.locator('button:has-text("Submit"), button:has-text("Next")').first();
  if (await submitBtn.isVisible().catch(() => false)) {
    await submitBtn.click();
    return "submit";
  }

  return "unknown";
}

test.describe("PDF Generation — Full Flow", () => {
  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      test.skip(true, "Set TEST_USER_EMAIL and TEST_USER_PASSWORD");
      return;
    }
    await page.goto("/login");
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard**", { timeout: 15_000 });
  });

  test("complete questionnaire → generate PDF → verify page count", async ({ page }) => {
    test.setTimeout(300_000);

    // Collect console logs
    page.on("console", (msg) => {
      if (msg.type() === "log" || msg.type() === "warn") {
        const text = msg.text();
        if (text.includes("[extract") || text.includes("Step") || text.includes("fullOrder"))
          console.log(`  [browser] ${text}`);
      }
    });

    await page.goto("/intake/modification");
    await page.waitForSelector("text=Petition to Modify Court Orders", { timeout: 15_000 });
    console.log("Page loaded: /intake/modification");

    // Welcome — click Continue
    const step1 = await answerCurrentQuestion(page);
    console.log(`Pre-upload step 1: ${step1}`);

    // Proceed — click Yes
    const step2 = await answerCurrentQuestion(page);
    console.log(`Pre-upload step 2: ${step2}`);

    // Upload PDF
    const fileInput = page.locator('input[type="file"][accept*="pdf"]');
    await expect(fileInput).toBeAttached({ timeout: 10_000 });
    console.log("File input found, uploading PDF...");
    await fileInput.setInputFiles(TEST_PDF);
    await expect(page.locator("text=View Extracted Document")).toBeVisible({ timeout: 90_000 });
    console.log("Extraction complete — View button visible");

    // Close auto-opened dialog
    const dialog = page.locator('[role="dialog"]');
    if (await dialog.isVisible().catch(() => false)) {
      await dialog.locator('button:has-text("Close")').first().click();
      await page.waitForTimeout(500);
    }

    // Confirm extraction data
    const useDataBtn = page.locator('button:has-text("Use this data")');
    await expect(useDataBtn).toBeVisible({ timeout: 5_000 });
    await useDataBtn.click();
    console.log("Clicked 'Use this data'");
    await page.waitForTimeout(2000);

    // Answer all remaining questions adaptively
    for (let step = 1; step <= 60; step++) {
      const result = await answerCurrentQuestion(page);
      console.log(`Step ${step}: ${result} | URL: ${page.url()}`);
      if (["complete", "redirected"].includes(result)) break;
      if (result === "generate") {
        // Wait for generation to complete
        await page.waitForTimeout(5000);
        break;
      }
      if (result === "unknown") {
        await page.screenshot({ path: `e2e/fixtures/unknown-step-${step}.png` });
        console.log(`Unknown at step ${step} — waiting 3s and retrying`);
        await page.waitForTimeout(3000);
        const retry = await answerCurrentQuestion(page);
        console.log(`Retry step ${step}: ${retry}`);
        if (["complete", "redirected", "generate", "unknown"].includes(retry)) break;
      }
    }

    // Wait for navigation — may go to /cases/ or /court-forms
    await page.waitForTimeout(5000);
    console.log(`After generate: ${page.url()}`);

    // Navigate to court-forms if not already there
    if (!page.url().includes("/court-forms")) {
      await page.goto("/court-forms");
      await page.waitForTimeout(3000);
    }

    // Find the Petition to Modify download button
    const petitionBtn = page.locator('button:has-text("Petition to Modify")').first();
    await expect(petitionBtn).toBeVisible({ timeout: 15_000 });
    console.log("Found 'Petition to Modify' button");

    // Use route interception to capture PDF bytes (fetch consumes the body before Playwright can read it)
    let pdfBuffer: Buffer | null = null;
    let pdfStatus = 0;
    await page.route("**/api/court-forms/generate", async (route) => {
      const response = await route.fetch();
      pdfStatus = response.status();
      pdfBuffer = await response.body();
      await route.fulfill({ response });
    });

    // Click Petition to Modify — opens signature pad
    await petitionBtn.click();
    console.log("Clicked Petition to Modify...");

    // Handle signature pad
    const signDialog = page.locator('[role="dialog"]:has-text("Sign Document")');
    if (await signDialog.isVisible({ timeout: 5_000 }).catch(() => false)) {
      const canvas = signDialog.locator("canvas").first();
      await expect(canvas).toBeVisible({ timeout: 5_000 });
      const box = await canvas.boundingBox();
      if (box) {
        await page.mouse.move(box.x + 30, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width - 30, box.y + box.height / 2 - 10, { steps: 10 });
        await page.mouse.up();
      }
      await page.waitForTimeout(300);
      await signDialog.locator('button:has-text("Sign & Download")').click();
      console.log("Signed — waiting for PDF generation...");
    }

    // Wait for the API response
    await page.waitForResponse(
      (resp) => resp.url().includes("/api/court-forms/generate"),
      { timeout: 90_000 }
    );

    console.log(`Petition API: ${pdfStatus} — ${pdfBuffer?.length || 0} bytes`);

    if (pdfStatus === 200 && pdfBuffer && pdfBuffer.length > 200) {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const doc = await pdfjsLib.getDocument({ data: new Uint8Array(pdfBuffer) }).promise;
      console.log(`\n✅ Petition to Modify PDF: ${doc.numPages} pages`);
      expect(doc.numPages).toBeGreaterThanOrEqual(1);
    } else {
      const errorText = pdfBuffer?.toString() || "empty";
      console.log(`Petition error: ${errorText}`);
      throw new Error(`PDF generation failed: ${pdfStatus} — ${errorText}`);
    }

    await page.screenshot({ path: "e2e/fixtures/case-page-final.png" });
  });
});
