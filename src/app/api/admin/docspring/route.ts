import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DOCSPRING_API_URL = "https://api.docspring.com/api/v1";

// Test API connection
async function testConnection(apiTokenId: string, apiTokenSecret: string) {
  const credentials = Buffer.from(`${apiTokenId}:${apiTokenSecret}`).toString("base64");

  try {
    const response = await fetch(`${DOCSPRING_API_URL}/templates?per_page=1`, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${credentials}`,
      },
    });

    if (response.ok) {
      return { success: true, message: "Connection successful" };
    } else {
      const error = await response.json().catch(() => ({}));
      return { success: false, message: error.error || `HTTP ${response.status}` };
    }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Connection failed" };
  }
}

// List templates from DocSpring
async function listTemplates(apiTokenId: string, apiTokenSecret: string) {
  const credentials = Buffer.from(`${apiTokenId}:${apiTokenSecret}`).toString("base64");

  try {
    const response = await fetch(`${DOCSPRING_API_URL}/templates?per_page=100`, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${credentials}`,
      },
    });

    if (!response.ok) {
      return { templates: [], error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { templates: data || [] };
  } catch (error) {
    return { templates: [], error: error instanceof Error ? error.message : "Failed to fetch templates" };
  }
}

// Get template details with fields from schema endpoint
async function getTemplateFields(apiTokenId: string, apiTokenSecret: string, templateId: string) {
  const credentials = Buffer.from(`${apiTokenId}:${apiTokenSecret}`).toString("base64");

  try {
    // Fetch both template details and schema (which contains fields)
    const [templateResponse, schemaResponse] = await Promise.all([
      fetch(`${DOCSPRING_API_URL}/templates/${templateId}`, {
        method: "GET",
        headers: { "Authorization": `Basic ${credentials}` },
      }),
      fetch(`${DOCSPRING_API_URL}/templates/${templateId}/schema`, {
        method: "GET",
        headers: { "Authorization": `Basic ${credentials}` },
      }),
    ]);

    if (!templateResponse.ok) {
      return { template: null, error: `HTTP ${templateResponse.status}` };
    }

    const templateData = await templateResponse.json();

    // Extract fields from schema
    let fields: { name: string; type: string; required: boolean }[] = [];
    if (schemaResponse.ok) {
      const schemaData = await schemaResponse.json();
      const properties = schemaData.properties || {};
      const requiredFields = schemaData.required || [];

      fields = Object.entries(properties).map(([name, config]: [string, any]) => {
        let fieldType = config.type || 'string';
        if (Array.isArray(fieldType)) {
          fieldType = fieldType.find((t: string) => t !== 'null') || 'string';
        }
        return {
          name,
          type: fieldType,
          required: requiredFields.includes(name),
          title: config.title || name,
          description: config.description || '',
        };
      });
    }

    return {
      template: {
        ...templateData,
        fields,
        editable_fields: fields,
      }
    };
  } catch (error) {
    return { template: null, error: error instanceof Error ? error.message : "Failed to fetch template" };
  }
}

// Proxy download endpoint to handle authenticated DocSpring downloads
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  // Handle PDF download proxy
  if (action === "download") {
    const submissionId = searchParams.get("submissionId");
    if (!submissionId) {
      return NextResponse.json({ error: "submissionId required" }, { status: 400 });
    }

    const apiTokenId = process.env.DOCSPRING_API_TOKEN_ID || "";
    const apiTokenSecret = process.env.DOCSPRING_API_TOKEN_SECRET || "";

    if (!apiTokenId || !apiTokenSecret) {
      return NextResponse.json({ error: "DocSpring not configured" }, { status: 500 });
    }

    const credentials = Buffer.from(`${apiTokenId}:${apiTokenSecret}`).toString("base64");

    try {
      const downloadResponse = await fetch(`${DOCSPRING_API_URL}/submissions/${submissionId}/download`, {
        method: "GET",
        headers: {
          "Authorization": `Basic ${credentials}`,
        },
      });

      if (!downloadResponse.ok) {
        return NextResponse.json({ error: `Download failed: ${downloadResponse.status}` }, { status: 500 });
      }

      const pdfBuffer = await downloadResponse.arrayBuffer();

      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="test-document-${submissionId}.pdf"`,
        },
      });
    } catch (error) {
      console.error("Download error:", error);
      return NextResponse.json({ error: "Download failed" }, { status: 500 });
    }
  }

  // Original GET handler continues below...
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const templateId = searchParams.get("templateId");

    // Get credentials from environment or database
    const apiTokenId = process.env.DOCSPRING_API_TOKEN_ID || "";
    const apiTokenSecret = process.env.DOCSPRING_API_TOKEN_SECRET || "";

    if (!apiTokenId || !apiTokenSecret) {
      return NextResponse.json({
        configured: false,
        message: "DocSpring API credentials not configured",
      });
    }

    switch (action) {
      case "test":
        const testResult = await testConnection(apiTokenId, apiTokenSecret);
        return NextResponse.json(testResult);

      case "templates":
        const templatesResult = await listTemplates(apiTokenId, apiTokenSecret);
        return NextResponse.json(templatesResult);

      case "template-fields":
        if (!templateId) {
          return NextResponse.json({ error: "templateId required" }, { status: 400 });
        }
        const fieldsResult = await getTemplateFields(apiTokenId, apiTokenSecret, templateId);
        return NextResponse.json(fieldsResult);

      case "config":
        // Get saved field mappings from database
        const { data: mappings } = await supabase
          .from("docspring_mappings")
          .select("*")
          .order("created_at", { ascending: false });

        return NextResponse.json({
          configured: true,
          hasCredentials: true,
          mappings: mappings || [],
        });

      default:
        return NextResponse.json({
          configured: true,
          hasCredentials: !!(apiTokenId && apiTokenSecret),
        });
    }

  } catch (error) {
    console.error("DocSpring admin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "test-credentials":
        const { apiTokenId, apiTokenSecret } = body;
        if (!apiTokenId || !apiTokenSecret) {
          return NextResponse.json({ error: "Credentials required" }, { status: 400 });
        }
        const testResult = await testConnection(apiTokenId, apiTokenSecret);
        return NextResponse.json(testResult);

      case "save-mapping":
        const { mapping } = body;
        if (!mapping) {
          return NextResponse.json({ error: "Mapping data required" }, { status: 400 });
        }

        console.log("Saving mapping:", JSON.stringify(mapping, null, 2));

        // Upsert the mapping
        const mappingData = {
          id: mapping.id || undefined,
          state: mapping.state,
          practice_area: mapping.practiceArea,
          document_type: mapping.documentType,
          template_id: mapping.templateId,
          template_name: mapping.templateName,
          field_mappings: mapping.fieldMappings || {},
          updated_by: user.id,
          updated_at: new Date().toISOString(),
          is_active: true,
        };

        // Remove undefined id for new records
        if (!mappingData.id) {
          delete mappingData.id;
        }

        const { data: savedMapping, error: saveError } = await supabase
          .from("docspring_mappings")
          .upsert(mappingData, {
            onConflict: "state,practice_area,document_type",
          })
          .select()
          .single();

        if (saveError) {
          console.error("Error saving mapping:", saveError);
          return NextResponse.json({
            error: `Failed to save mapping: ${saveError.message}`,
            details: saveError
          }, { status: 500 });
        }

        console.log("Mapping saved successfully:", savedMapping);
        return NextResponse.json({ success: true, mapping: savedMapping });

      case "delete-mapping":
        const { mappingId } = body;
        if (!mappingId) {
          return NextResponse.json({ error: "Mapping ID required" }, { status: 400 });
        }

        const { error: deleteError } = await supabase
          .from("docspring_mappings")
          .delete()
          .eq("id", mappingId);

        if (deleteError) {
          return NextResponse.json({ error: "Failed to delete mapping" }, { status: 500 });
        }

        return NextResponse.json({ success: true });

      case "quick-test":
        // Quick test with just 2 custom fields
        const { templateId: qtTemplateId, testData } = body;
        if (!qtTemplateId) {
          return NextResponse.json({ error: "Template ID required" }, { status: 400 });
        }

        const qtApiTokenId = process.env.DOCSPRING_API_TOKEN_ID || "";
        const qtApiTokenSecret = process.env.DOCSPRING_API_TOKEN_SECRET || "";

        if (!qtApiTokenId || !qtApiTokenSecret) {
          return NextResponse.json({ error: "DocSpring credentials not configured" }, { status: 500 });
        }

        const qtCredentials = Buffer.from(`${qtApiTokenId}:${qtApiTokenSecret}`).toString("base64");

        try {
          const qtResponse = await fetch(`${DOCSPRING_API_URL}/templates/${qtTemplateId}/submissions`, {
            method: "POST",
            headers: {
              "Authorization": `Basic ${qtCredentials}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: testData || {},
              test: true,
              wait: true,
            }),
          });

          if (!qtResponse.ok) {
            const errorData = await qtResponse.json().catch(() => ({}));
            console.error("DocSpring error response:", JSON.stringify(errorData, null, 2));
            return NextResponse.json({
              error: errorData.error || errorData.message || `Generation failed: HTTP ${qtResponse.status}`,
              details: errorData.errors || errorData.status || null,
              hint: "Make sure field names match exactly with your template fields"
            }, { status: 500 });
          }

          const qtResult = await qtResponse.json();
          console.log("DocSpring initial response:", JSON.stringify(qtResult, null, 2));
          let qtSubmission = qtResult.submission || qtResult;

          // If state is pending, poll for completion
          if (qtSubmission.state === "pending" && qtSubmission.id) {
            console.log("Submission pending, polling for completion...");
            const maxAttempts = 15; // 15 attempts x 2 seconds = 30 seconds max
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
              await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

              const statusResponse = await fetch(`${DOCSPRING_API_URL}/submissions/${qtSubmission.id}`, {
                method: "GET",
                headers: {
                  "Authorization": `Basic ${qtCredentials}`,
                },
              });

              if (statusResponse.ok) {
                qtSubmission = await statusResponse.json();
                console.log(`Poll attempt ${attempt + 1}: state = ${qtSubmission.state}`);

                if (qtSubmission.state === "processed") {
                  console.log("PDF processed successfully!");
                  break;
                } else if (qtSubmission.state === "error" || qtSubmission.state === "invalid_data") {
                  return NextResponse.json({
                    error: `DocSpring error: ${qtSubmission.error_message || qtSubmission.state}`,
                    details: qtSubmission
                  }, { status: 500 });
                }
              }
            }
          }

          const downloadUrl = qtSubmission.permanent_download_url || qtSubmission.download_url;
          console.log("Final Download URL:", downloadUrl);
          console.log("Final Submission state:", qtSubmission.state);

          if (!downloadUrl) {
            return NextResponse.json({
              error: "PDF generation timed out or failed. Try again.",
              state: qtSubmission.state,
              details: qtSubmission
            }, { status: 500 });
          }

          // Return proxy URL instead of direct DocSpring URL (which requires auth)
          const proxyDownloadUrl = `/api/admin/docspring?action=download&submissionId=${qtSubmission.id}`;

          return NextResponse.json({
            success: true,
            download_url: proxyDownloadUrl,
            direct_url: downloadUrl, // Keep direct URL for reference
            submission_id: qtSubmission.id,
            state: qtSubmission.state,
          });
        } catch (qtError) {
          console.error("Quick test error:", qtError);
          return NextResponse.json({
            error: qtError instanceof Error ? qtError.message : "PDF generation failed"
          }, { status: 500 });
        }

      case "test-generate":
        const { templateId, fieldMappings } = body;
        if (!templateId) {
          return NextResponse.json({ error: "Template ID required" }, { status: 400 });
        }

        // Sample test data matching DivorceIntakeData structure
        const sampleData: Record<string, unknown> = {
          // Petitioner Info
          "personalInfo.fullLegalName": "John Michael Smith",
          "personalInfo.dateOfBirth": "03/15/1985",
          "personalInfo.currentAddress": "123 Main Street",
          "personalInfo.city": "Phoenix",
          "personalInfo.state": "AZ",
          "personalInfo.zipCode": "85001",
          "personalInfo.county": "Maricopa",
          "personalInfo.phoneNumber": "(555) 123-4567",
          "personalInfo.email": "john.smith@email.com",
          "personalInfo.isCurrentlyEmployed": true,
          "personalInfo.employer": "ABC Corporation",
          "personalInfo.occupation": "Software Engineer",
          "personalInfo.fullAddress": "123 Main Street, Phoenix, AZ 85001",

          // Spouse/Respondent Info
          "spouseInfo.fullLegalName": "Jane Marie Smith",
          "spouseInfo.dateOfBirth": "08/22/1987",
          "spouseInfo.currentAddress": "456 Oak Avenue",
          "spouseInfo.city": "Phoenix",
          "spouseInfo.state": "AZ",
          "spouseInfo.zipCode": "85002",
          "spouseInfo.county": "Maricopa",
          "spouseInfo.phoneNumber": "(555) 987-6543",
          "spouseInfo.email": "jane.smith@email.com",
          "spouseInfo.isCurrentlyEmployed": true,
          "spouseInfo.employer": "XYZ Company",
          "spouseInfo.occupation": "Marketing Manager",
          "spouseInfo.fullAddress": "456 Oak Avenue, Phoenix, AZ 85002",

          // Marriage Info
          "marriageInfo.dateOfMarriage": "06/20/2015",
          "marriageInfo.cityOfMarriage": "Las Vegas",
          "marriageInfo.stateOfMarriage": "Nevada",
          "marriageInfo.dateOfSeparation": "01/15/2024",
          "marriageInfo.meetsResidencyRequirement": true,
          "marriageInfo.placeOfMarriage": "Las Vegas, Nevada",

          // Real Estate
          "hasRealEstate": true,
          "realEstateProperties[0].address": "789 Family Home Drive, Phoenix, AZ 85003",
          "realEstateProperties[0].estimatedValue": 450000,
          "realEstateProperties[0].mortgageBalance": 280000,
          "realEstateProperties[0].equity": 170000,
          "realEstateProperties[0].whoGetsProperty": "sell_split",

          // Furniture
          "hasFurniture": true,
          "furniture.divisionMethod": "already_divided",
          "furniture.specialItems": "Antique dining set, Piano",

          // Bank Accounts
          "hasBankAccounts": true,
          "bankAccounts[0].institution": "Chase Bank",
          "bankAccounts[0].accountType": "checking",
          "bankAccounts[0].approximateBalance": 15000,
          "bankAccounts[0].whoGetsAccount": "split",
          "bankAccounts[1].institution": "Bank of America",
          "bankAccounts[1].approximateBalance": 8500,

          // Retirement
          "hasRetirementAccounts": true,
          "retirementAccounts[0].institution": "Fidelity",
          "retirementAccounts[0].accountType": "401k",
          "retirementAccounts[0].owner": "petitioner",
          "retirementAccounts[0].approximateValue": 125000,
          "retirementAccounts[0].whoGetsAccount": "split",

          // Vehicles
          "hasVehicles": true,
          "vehicles[0].year": "2021",
          "vehicles[0].make": "Toyota",
          "vehicles[0].model": "Camry",
          "vehicles[0].description": "2021 Toyota Camry",
          "vehicles[0].estimatedValue": 28000,
          "vehicles[0].loanBalance": 12000,
          "vehicles[0].equity": 16000,
          "vehicles[0].whoGetsVehicle": "petitioner",
          "vehicles[1].description": "2020 Honda CR-V",
          "vehicles[1].whoGetsVehicle": "respondent",

          // Debts
          "hasDebts": true,
          "debts[0].creditor": "Visa",
          "debts[0].debtType": "credit_card",
          "debts[0].approximateBalance": 5000,
          "debts[0].whoIsResponsible": "split",

          // Spousal Maintenance
          "spousalMaintenance.isRequesting": false,

          // Tax Filing
          "taxFiling.filingPreference": "file_separately",

          // System fields
          "currentDate": new Date().toLocaleDateString("en-US"),
          "caseNumber": "TEST-2024-001",
          "hasChildren": false,
        };

        // Apply field mappings to transform sample data to DocSpring format
        const docspringData: Record<string, unknown> = {};

        if (fieldMappings && Object.keys(fieldMappings).length > 0) {
          for (const [docspringField, intakeField] of Object.entries(fieldMappings)) {
            const value = sampleData[intakeField as string];
            if (value !== undefined) {
              docspringData[docspringField] = value;
            }
          }
        } else {
          // No mappings - just use sample data keys directly
          Object.assign(docspringData, sampleData);
        }

        // Generate test PDF using DocSpring
        const genApiTokenId = process.env.DOCSPRING_API_TOKEN_ID || "";
        const genApiTokenSecret = process.env.DOCSPRING_API_TOKEN_SECRET || "";

        if (!genApiTokenId || !genApiTokenSecret) {
          return NextResponse.json({ error: "DocSpring credentials not configured" }, { status: 500 });
        }

        const genCredentials = Buffer.from(`${genApiTokenId}:${genApiTokenSecret}`).toString("base64");

        try {
          const genResponse = await fetch(`${DOCSPRING_API_URL}/templates/${templateId}/submissions`, {
            method: "POST",
            headers: {
              "Authorization": `Basic ${genCredentials}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: docspringData,
              test: true, // Use test mode
              wait: true, // Wait for PDF generation
            }),
          });

          if (!genResponse.ok) {
            const errorData = await genResponse.json().catch(() => ({}));
            return NextResponse.json({
              error: errorData.error || `Generation failed: HTTP ${genResponse.status}`
            }, { status: 500 });
          }

          const genResult = await genResponse.json();
          const submission = genResult.submission || genResult;

          return NextResponse.json({
            success: true,
            submission: {
              id: submission.id,
              state: submission.state,
              download_url: submission.download_url,
              permanent_download_url: submission.permanent_download_url,
            },
            download_url: submission.permanent_download_url || submission.download_url,
            mappedFieldsCount: Object.keys(docspringData).length,
          });
        } catch (genError) {
          console.error("DocSpring generation error:", genError);
          return NextResponse.json({
            error: genError instanceof Error ? genError.message : "PDF generation failed"
          }, { status: 500 });
        }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

  } catch (error) {
    console.error("DocSpring admin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
