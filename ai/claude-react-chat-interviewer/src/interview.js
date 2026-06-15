// Field catalog for PII collected via the secure client-side form.
// These values are NEVER sent to the model — only the field keys are.
export const PII_FIELDS = {
  full_name: {
    label: "Full name",
    type: "text",
    placeholder: "Jane Doe",
    autoComplete: "name",
  },
  email: {
    label: "Email",
    type: "email",
    placeholder: "jane@example.com",
    autoComplete: "email",
    validate: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Enter a valid email",
  },
  phone: {
    label: "Phone",
    type: "tel",
    placeholder: "+1 555 123 4567",
    autoComplete: "tel",
    validate: (v) =>
      v.replace(/\D/g, "").length >= 7 || "Enter a valid phone number",
  },
  document: {
    label: "ID / document number",
    type: "text",
    placeholder: "Passport, national ID, SSN…",
    autoComplete: "off",
  },
  address: {
    label: "Postal address",
    type: "textarea",
    placeholder: "Street, city, postal code, country",
    autoComplete: "street-address",
  },
};

const PII_KEYS = Object.keys(PII_FIELDS);

export const SYSTEM_PROMPT = `You are an interviewer running an initial screening for a job application. Be warm, concise, and conversational — ask one or two questions at a time, never a long form.

Cover these professional topics in plain text (they are NOT sensitive):
- The position / role the applicant is applying for
- Years of experience and key skills
- Current or most recent role and a notable achievement
- Availability or notice period

CRITICAL — Personally Identifiable Information (PII):
PII = full name, email, phone number, government ID / document number, postal address.
NEVER ask the applicant to type PII into the chat, and never try to read it.
When you need any PII, call the \`collect_personal_info\` tool with the fields you need (you may request several at once). A secure form renders in the UI; the applicant fills it on their device. The values are stored locally and are NEVER sent to you — you only receive confirmation of which fields were completed. Refer to PII generically ("your email", "your address"); do not guess or echo values.

Flow: greet the applicant and ask the position first. Work through the professional topics. Collect the required PII through the tool. When everything is gathered, call \`submit_application\` with a short NON-PII professional summary to finish. Do not put any personal identifiers in that summary.`;

export const collectPersonalInfoTool = {
  name: "collect_personal_info",
  description:
    "Request personally identifiable information (PII) from the applicant through a secure form. Use this WHENEVER you need full name, email, phone, government document/ID number, or postal address — never ask for those in plain chat. A form renders client-side; the applicant's values stay on their device and are NOT returned to you. You only receive which fields were completed.",
  input_schema: {
    type: "object",
    properties: {
      fields: {
        type: "array",
        items: { type: "string", enum: PII_KEYS },
        description:
          "Which PII fields to request via the secure form. Request only what you need.",
      },
      note: {
        type: "string",
        description:
          "Short friendly line shown above the form explaining what you need and why.",
      },
    },
    required: ["fields"],
  },
  // No execute(): this tool is interactive and resolved by the UI form.
  interactive: true,
};

export const submitApplicationTool = {
  name: "submit_application",
  description:
    "Finalize the screening once the professional topics are covered and the required PII has been collected via the form. Provide a NON-PII professional summary only. Never include personal identifiers (no name, email, phone, document, or address).",
  input_schema: {
    type: "object",
    properties: {
      position: {
        type: "string",
        description: "The role the applicant is applying for.",
      },
      summary: {
        type: "string",
        description:
          "2–4 sentence professional summary of the applicant. No PII.",
      },
      highlights: {
        type: "array",
        items: { type: "string" },
        description: "Optional short bullet points of key skills/achievements.",
      },
    },
    required: ["position", "summary"],
  },
  async execute() {
    return { ok: true, kind: "application_submitted" };
  },
};

export const tools = [collectPersonalInfoTool, submitApplicationTool];

export const toolsByName = Object.fromEntries(tools.map((t) => [t.name, t]));

export const INTERACTIVE_TOOLS = new Set(
  tools.filter((t) => t.interactive).map((t) => t.name),
);

export function toolSchemas() {
  return tools.map(({ name, description, input_schema }) => ({
    name,
    description,
    input_schema,
  }));
}
