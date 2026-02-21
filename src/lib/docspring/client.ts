/**
 * DocSpring Integration
 *
 * DocSpring is a PDF generation API that uses templates.
 *
 * Setup:
 * 1. Create account at https://docspring.com
 * 2. Upload PDF templates with form fields
 * 3. Get your API Token ID and API Token Secret
 * 4. Add to .env.local:
 *    DOCSPRING_API_TOKEN_ID=your_token_id
 *    DOCSPRING_API_TOKEN_SECRET=your_token_secret
 */

const DOCSPRING_API_URL = "https://api.docspring.com/api/v1";

interface DocSpringConfig {
  apiTokenId: string;
  apiTokenSecret: string;
}

interface TemplateField {
  [key: string]: string | number | boolean | null;
}

interface GeneratePDFOptions {
  templateId: string;
  data: TemplateField;
  metadata?: Record<string, string>;
  test?: boolean;
  waitForSubmission?: boolean;
}

interface SubmissionResponse {
  id: string;
  state: "pending" | "processed" | "error" | "invalid_data" | "waiting_for_data_requests";
  download_url?: string;
  permanent_download_url?: string;
  expired?: boolean;
  expires_at?: string;
  pdf_hash?: string;
  errors?: string[];
}

interface CreateSubmissionResult {
  status: "success" | "error";
  submission?: SubmissionResponse;
  error?: string;
}

class DocSpringClient {
  private config: DocSpringConfig | null = null;

  private getConfig(): DocSpringConfig {
    if (this.config) return this.config;

    const apiTokenId = process.env.DOCSPRING_API_TOKEN_ID;
    const apiTokenSecret = process.env.DOCSPRING_API_TOKEN_SECRET;

    if (!apiTokenId || !apiTokenSecret) {
      throw new Error(
        "DocSpring API credentials not configured. " +
        "Set DOCSPRING_API_TOKEN_ID and DOCSPRING_API_TOKEN_SECRET in .env.local"
      );
    }

    this.config = { apiTokenId, apiTokenSecret };
    return this.config;
  }

  private getAuthHeader(): string {
    const { apiTokenId, apiTokenSecret } = this.getConfig();
    const credentials = Buffer.from(`${apiTokenId}:${apiTokenSecret}`).toString("base64");
    return `Basic ${credentials}`;
  }

  /**
   * Generate a PDF from a template
   */
  async generatePDF(options: GeneratePDFOptions): Promise<CreateSubmissionResult> {
    const { templateId, data, metadata = {}, test = false, waitForSubmission = true } = options;

    try {
      // Create submission
      const response = await fetch(`${DOCSPRING_API_URL}/templates/${templateId}/submissions`, {
        method: "POST",
        headers: {
          "Authorization": this.getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data,
          metadata,
          test,
          wait: waitForSubmission,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          status: "error",
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const result = await response.json();

      return {
        status: "success",
        submission: result.submission || result,
      };
    } catch (error) {
      return {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Get submission status
   */
  async getSubmission(submissionId: string): Promise<SubmissionResponse | null> {
    try {
      const response = await fetch(`${DOCSPRING_API_URL}/submissions/${submissionId}`, {
        method: "GET",
        headers: {
          "Authorization": this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch {
      return null;
    }
  }

  /**
   * List all templates
   */
  async listTemplates(): Promise<{ id: string; name: string; description: string }[]> {
    try {
      const response = await fetch(`${DOCSPRING_API_URL}/templates`, {
        method: "GET",
        headers: {
          "Authorization": this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        return [];
      }

      return await response.json();
    } catch {
      return [];
    }
  }

  /**
   * Get template details
   */
  async getTemplate(templateId: string): Promise<{
    id: string;
    name: string;
    description: string;
    fields: { name: string; type: string; required: boolean }[];
  } | null> {
    try {
      const response = await fetch(`${DOCSPRING_API_URL}/templates/${templateId}`, {
        method: "GET",
        headers: {
          "Authorization": this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch {
      return null;
    }
  }

  /**
   * Check if DocSpring is configured
   */
  isConfigured(): boolean {
    return !!(process.env.DOCSPRING_API_TOKEN_ID && process.env.DOCSPRING_API_TOKEN_SECRET);
  }
}

// Singleton instance
let docspringClient: DocSpringClient | null = null;

export function getDocSpring(): DocSpringClient {
  if (!docspringClient) {
    docspringClient = new DocSpringClient();
  }
  return docspringClient;
}

// Template IDs mapping - Map your uploaded DocSpring templates here
export const DOCSPRING_TEMPLATES = {
  // Arizona Templates
  "AZ": {
    "family_law": {
      "petition_for_divorce": "tpl_xxxxxxxxxxxxx", // Replace with actual template ID
      "custody_motion": "tpl_xxxxxxxxxxxxx",
      "child_support_worksheet": "tpl_xxxxxxxxxxxxx",
      "parenting_plan": "tpl_xxxxxxxxxxxxx",
    },
    "personal_injury": {
      "demand_letter": "tpl_xxxxxxxxxxxxx",
      "complaint": "tpl_xxxxxxxxxxxxx",
      "settlement_agreement": "tpl_xxxxxxxxxxxxx",
    },
    "estate_planning": {
      "last_will_testament": "tpl_xxxxxxxxxxxxx",
      "power_of_attorney": "tpl_xxxxxxxxxxxxx",
      "healthcare_directive": "tpl_xxxxxxxxxxxxx",
    },
  },
  // Nevada Templates
  "NV": {
    "family_law": {
      "petition_for_divorce": "tpl_xxxxxxxxxxxxx",
      "custody_motion": "tpl_xxxxxxxxxxxxx",
    },
    "personal_injury": {
      "demand_letter": "tpl_xxxxxxxxxxxxx",
      "complaint": "tpl_xxxxxxxxxxxxx",
    },
    "estate_planning": {
      "last_will_testament": "tpl_xxxxxxxxxxxxx",
      "power_of_attorney": "tpl_xxxxxxxxxxxxx",
    },
  },
  // Texas Templates
  "TX": {
    "family_law": {
      "petition_for_divorce": "tpl_xxxxxxxxxxxxx",
      "custody_motion": "tpl_xxxxxxxxxxxxx",
    },
    "personal_injury": {
      "demand_letter": "tpl_xxxxxxxxxxxxx",
      "complaint": "tpl_xxxxxxxxxxxxx",
    },
    "estate_planning": {
      "last_will_testament": "tpl_xxxxxxxxxxxxx",
      "power_of_attorney": "tpl_xxxxxxxxxxxxx",
    },
  },
} as const;

/**
 * Get template ID for a specific document
 */
export function getTemplateId(
  state: "AZ" | "NV" | "TX",
  practiceArea: "family_law" | "personal_injury" | "estate_planning",
  documentType: string
): string | null {
  const stateTemplates = DOCSPRING_TEMPLATES[state];
  if (!stateTemplates) return null;

  const areaTemplates = stateTemplates[practiceArea];
  if (!areaTemplates) return null;

  return (areaTemplates as Record<string, string>)[documentType] || null;
}

export type { SubmissionResponse, GeneratePDFOptions, CreateSubmissionResult };
