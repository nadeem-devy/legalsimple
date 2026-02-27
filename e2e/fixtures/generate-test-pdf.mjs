/**
 * Generates an 11-page court order PDF for testing extraction.
 * Run: node e2e/fixtures/generate-test-pdf.mjs
 */
import PDFDocument from "pdfkit";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function generateTestPdf() {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: "LETTER", margin: 72 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    // Page 1
    doc.fontSize(14).font("Helvetica-Bold").text("IN THE SUPERIOR COURT OF THE STATE OF ARIZONA", { align: "center" });
    doc.text("IN AND FOR THE COUNTY OF MARICOPA", { align: "center" });
    doc.moveDown();
    doc.fontSize(11).font("Helvetica");
    doc.text("AMY ELDER,");
    doc.text("    Petitioner,");
    doc.text("vs.                                          Case No.: FC-2014-003563");
    doc.text("JUSTIN ELDER,");
    doc.text("    Respondent.");
    doc.moveDown();
    doc.fontSize(12).font("Helvetica-Bold").text("JOINT LEGAL DECISION MAKING AGREEMENT AND PARENTING PLAN", { align: "center" });
    doc.moveDown();
    doc.fontSize(10).font("Helvetica");
    doc.text("A. LEGAL DECISION MAKING");
    doc.text("The parties shall have joint legal decision making regarding the minor children.");
    doc.text("Both parents shall consult with each other on all major decisions.");
    doc.text("Major decisions include education, healthcare, and religious upbringing.");
    doc.moveDown();
    doc.text("B. CHILDREN");
    doc.text("1. Child One Elder, DOB: 01/15/2010");
    doc.text("2. Child Two Elder, DOB: 03/22/2012");
    doc.moveDown();
    doc.text("C. PARENTING TIME SCHEDULE");
    doc.text("The following parenting time schedule shall apply:");
    doc.text("Mother shall have parenting time every Monday and Tuesday.");
    doc.text("Father shall have parenting time every Wednesday and Thursday.");
    doc.text("The parents shall alternate weekends from Friday at 6:00 PM to Sunday at 6:00 PM.");

    // Page 2
    doc.addPage();
    doc.fontSize(10).font("Helvetica");
    doc.text("D. HOLIDAY SCHEDULE");
    doc.moveDown();
    const holidays = [
      "1. New Year's Day: Mother in even years, Father in odd years",
      "2. Martin Luther King Jr. Day: Father in even years, Mother in odd years",
      "3. Presidents' Day: Mother in even years, Father in odd years",
      "4. Spring Break: First half with Mother, second half with Father in even years; reversed in odd years",
      "5. Easter: Mother in even years, Father in odd years",
      "6. Mother's Day: Always with Mother from 9:00 AM to 7:00 PM",
      "7. Memorial Day Weekend: Father in even years, Mother in odd years",
      "8. Father's Day: Always with Father from 9:00 AM to 7:00 PM",
      "9. Fourth of July: Mother in even years, Father in odd years",
      "10. Labor Day Weekend: Father in even years, Mother in odd years",
      "11. Halloween: Mother in even years, Father in odd years. Non-custodial parent may participate in trick-or-treating.",
      "12. Thanksgiving: Mother in even years (Wednesday 6 PM to Friday 6 PM), Father in odd years",
      "13. Christmas Eve: Mother in even years (December 23 at 6 PM to December 24 at 6 PM)",
      "14. Christmas Day: Father in even years (December 24 at 6 PM to December 25 at 6 PM)",
      "15. Children's Birthdays: The parent who does not have regular parenting time shall have 2 hours",
    ];
    for (const h of holidays) { doc.text(h); doc.moveDown(0.3); }

    // Page 3
    doc.addPage();
    doc.text("E. EXTENDED PARENTING TIME");
    doc.moveDown();
    doc.text("Each parent shall have up to two (2) weeks of uninterrupted vacation time with the children during the summer months.");
    doc.text("The requesting parent shall provide at least 30 days written notice of intended vacation dates.");
    doc.text("Vacation time shall not conflict with the other parent's previously scheduled vacation.");
    doc.text("Both parents shall provide an itinerary and contact information during vacation travel.");
    doc.moveDown();
    doc.text("F. TRAVEL");
    doc.text("Neither parent shall travel outside the State of Arizona with the children without providing the other parent with:");
    doc.text("   a. At least 14 days advance written notice");
    doc.text("   b. Travel itinerary including destinations and accommodations");
    doc.text("   c. Contact telephone numbers");
    doc.text("   d. Flight information if applicable");
    doc.text("Neither parent shall travel internationally without the written consent of the other parent or court order.");
    doc.moveDown();
    doc.text("G. TELEPHONE AND ELECTRONIC COMMUNICATION");
    doc.text("Each parent shall have reasonable telephone and video communication with the children.");
    doc.text("Calls shall be made at reasonable hours (between 8:00 AM and 8:00 PM).");
    doc.text("Neither parent shall monitor, record, or interfere with the children's communications with the other parent.");

    // Page 4
    doc.addPage();
    doc.text("H. EDUCATION");
    doc.text("Both parents shall have equal access to all school records and communications.");
    doc.text("Both parents shall be listed as emergency contacts at the children's school.");
    doc.text("Both parents may attend all school events, parent-teacher conferences, and activities.");
    doc.text("Major educational decisions shall be made jointly.");
    doc.moveDown();
    doc.text("I. MEDICAL AND HEALTH CARE");
    doc.text("Both parents shall have equal access to all medical, dental, and psychological records.");
    doc.text("Both parents shall be listed as authorized contacts with all healthcare providers.");
    doc.text("Emergency medical decisions may be made by whichever parent the child is with at the time.");
    doc.text("Non-emergency medical decisions shall be made jointly after consultation.");
    doc.text("Each parent shall promptly inform the other of any illness, injury, or medical emergency.");
    doc.moveDown();
    doc.text("J. CHILD SUPPORT");
    doc.text("Father shall pay child support in the amount of $850.00 per month.");
    doc.text("Payment shall be made on the 1st day of each month through the Support Payment Clearinghouse.");
    doc.text("This amount is calculated pursuant to the Arizona Child Support Guidelines.");

    // Page 5
    doc.addPage();
    doc.text("K. ADDITIONAL PROVISIONS");
    doc.moveDown();
    doc.text("1. Each parent shall encourage the children to maintain a close and loving relationship with the other parent.");
    doc.text("2. Neither parent shall make disparaging remarks about the other parent in the presence of the children.");
    doc.text("3. Both parents shall participate in mediation before filing any motion to modify this agreement.");
    doc.text("4. Neither parent shall use the children as messengers between the parents.");
    doc.text("5. Both parents shall maintain the children's current extracurricular activities.");
    doc.text("6. Neither parent shall introduce the children to a new romantic partner until the relationship has existed for at least six months.");
    doc.text("7. Both parents shall ensure that the children have appropriate clothing and personal items at each residence.");
    doc.text("8. Both parents shall keep the other informed of any changes in address, telephone number, or employment.");
    doc.moveDown();
    doc.text("L. RELIGIOUS TRAINING");
    doc.text("The parents shall jointly determine the religious upbringing and training of the children.");
    doc.text("Neither parent shall unilaterally enroll the children in religious activities or instruction.");

    // Page 6
    doc.addPage();
    doc.text("M. LEGAL DECISION MAKING AGREEMENT");
    doc.moveDown();
    doc.text("The parties agree to joint legal decision making with the following specifications:");
    doc.text("1. Education: Both parents shall jointly select schools, tutors, and educational programs.");
    doc.text("2. Healthcare: Both parents shall jointly select healthcare providers.");
    doc.text("3. Religious Training: Both parents shall jointly determine religious instruction and activities.");
    doc.text("4. Personal Care: Both parents shall jointly determine matters of personal care.");
    doc.moveDown();
    doc.text("In the event the parents cannot agree on a major decision after good-faith efforts,");
    doc.text("the parties shall attend mediation. If mediation is unsuccessful, either party may petition the Court.");
    doc.moveDown();
    doc.text("N. SEX OFFENDER NOTIFICATION");
    doc.text("Both parents are notified that information about sex offenders in Arizona is available from local law enforcement.");
    doc.text("A.R.S. Section 13-3827 provides that persons required to register may be found through the Department of Public Safety.");
    doc.moveDown();
    doc.text("DANGEROUS CRIMES AGAINST CHILDREN");
    doc.text("The following offenses constitute dangerous crimes against children as defined by A.R.S. Section 13-705:");
    doc.text("  - Second degree murder, aggravated assault, sexual assault");
    doc.text("  - Molestation of a child, commercial sexual exploitation of a minor");
    doc.text("  - Sexual exploitation of a minor, child abuse, kidnapping");

    // Page 7
    doc.addPage();
    doc.text("O. DUI/DRUG CONVICTIONS AND DOMESTIC VIOLENCE");
    doc.moveDown();
    doc.text("Each parent affirms that they have not been convicted of any of the following within the past five years:");
    doc.text("1. Driving under the influence of alcohol or drugs (DUI/DWI)");
    doc.text("2. Any drug-related offense");
    doc.text("3. Any domestic violence offense");
    doc.moveDown();
    doc.text("If either parent is convicted of DUI, drug offense, or domestic violence during the term of this agreement,");
    doc.text("the other parent may petition the Court for immediate modification of parenting time.");
    doc.moveDown();
    doc.text("P. RELOCATION");
    doc.text("Either parent who wishes to relocate more than 100 miles from the current residence or out of state");
    doc.text("shall provide 45 days written notice to the other parent and comply with A.R.S. Section 25-408.");
    doc.moveDown();
    doc.text("Q. ENFORCEMENT");
    doc.text("This agreement may be enforced through the Court's contempt powers pursuant to A.R.S. Section 25-414.");
    doc.text("The prevailing party in any enforcement action may be awarded reasonable attorney's fees and costs.");

    // Page 8 - Judge signature
    doc.addPage();
    doc.moveDown(2);
    doc.text("IT IS SO ORDERED this ____ day of ______________, 2014.");
    doc.moveDown(3);
    doc.text("________________________________________");
    doc.text("HON. JOSEPH C. WELTY");
    doc.text("Judge of the Superior Court");
    doc.moveDown(4);
    doc.text("APPROVED AND CONSENTED TO:");
    doc.moveDown(2);
    doc.text("________________________________________        Date: _______________");
    doc.text("AMY ELDER, Petitioner");
    doc.moveDown(2);
    doc.text("________________________________________        Date: _______________");
    doc.text("JUSTIN ELDER, Respondent");

    // Page 9 - Oath Petitioner
    doc.addPage();
    doc.fontSize(12).font("Helvetica-Bold").text("OATH AND AFFIRMATION", { align: "center" });
    doc.moveDown();
    doc.fontSize(10).font("Helvetica");
    doc.text("STATE OF ARIZONA        )");
    doc.text("                        ) ss.");
    doc.text("County of Maricopa      )");
    doc.moveDown();
    doc.text("I, AMY ELDER, being first duly sworn upon oath, state under penalty of perjury that the foregoing");
    doc.text("Joint Legal Decision Making Agreement and Parenting Plan is true and correct to the best of my knowledge.");
    doc.moveDown(2);
    doc.text("________________________________________");
    doc.text("AMY ELDER, Petitioner");
    doc.moveDown();
    doc.text("Subscribed and sworn to before me this ____ day of ______________, 2014.");
    doc.moveDown(2);
    doc.text("________________________________________");
    doc.text("Notary Public");
    doc.text("My Commission Expires: _______________");

    // Page 10 - Oath Respondent
    doc.addPage();
    doc.fontSize(12).font("Helvetica-Bold").text("OATH AND AFFIRMATION", { align: "center" });
    doc.moveDown();
    doc.fontSize(10).font("Helvetica");
    doc.text("STATE OF ARIZONA        )");
    doc.text("                        ) ss.");
    doc.text("County of Maricopa      )");
    doc.moveDown();
    doc.text("I, JUSTIN ELDER, being first duly sworn upon oath, state under penalty of perjury that the foregoing");
    doc.text("Joint Legal Decision Making Agreement and Parenting Plan is true and correct to the best of my knowledge.");
    doc.moveDown(2);
    doc.text("________________________________________");
    doc.text("JUSTIN ELDER, Respondent");
    doc.moveDown();
    doc.text("Subscribed and sworn to before me this ____ day of ______________, 2014.");
    doc.moveDown(2);
    doc.text("________________________________________");
    doc.text("Notary Public");
    doc.text("My Commission Expires: _______________");

    // Page 11 - Certificate of service
    doc.addPage();
    doc.fontSize(12).font("Helvetica-Bold").text("CERTIFICATE OF SERVICE", { align: "center" });
    doc.moveDown();
    doc.fontSize(10).font("Helvetica");
    doc.text("I hereby certify that on ______________, 2014, I caused a copy of the foregoing");
    doc.text("Joint Legal Decision Making Agreement and Parenting Plan to be served upon:");
    doc.moveDown();
    doc.text("Justin Elder");
    doc.text("123 Main Street");
    doc.text("Phoenix, AZ 85001");
    doc.moveDown();
    doc.text("by the following method:");
    doc.text("[  ] Hand delivery");
    doc.text("[  ] U.S. Mail, postage prepaid");
    doc.text("[  ] Certified Mail, Return Receipt Requested");
    doc.text("[  ] Electronic filing and service");
    doc.moveDown(2);
    doc.text("________________________________________");
    doc.text("AMY ELDER, Petitioner");

    doc.end();
  });
}

const buffer = await generateTestPdf();
const outPath = resolve(__dirname, "test-court-order.pdf");
writeFileSync(outPath, buffer);
console.log(`Generated ${buffer.length} byte PDF at ${outPath}`);
