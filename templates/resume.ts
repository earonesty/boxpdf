// Copy-paste template: a clean two-section resume using editorialTheme.
//
// Substitute your own bio, experience, education, skills. Multi-page-safe:
// each role is wrapped in `keepTogether` so it never splits across a page
// break, and `renderFlow` paginates the rest. Designed at A4 portrait.

import { writeFileSync } from "node:fs";
import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  editorialTheme,
  hline,
  hstack,
  keepTogether,
  link,
  renderFlow,
  text,
  vstack,
  type Node
} from "../src/index.js";

interface Role {
  company: string;
  title: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
}

const me = {
  name: "Avery Chen",
  title: "Senior Software Engineer",
  email: "avery.chen@example.com",
  phone: "+1 (415) 555-0182",
  website: "averychen.dev",
  location: "San Francisco, CA"
};

const summary =
  "Software engineer with 9 years building backend and platform systems at the edge — payments, identity, and developer tooling. Currently focused on serverless infrastructure and the developer experience of running stateful workloads outside long-lived VMs.";

const experience: Role[] = [
  {
    company: "Edgeworth Labs",
    title: "Staff Engineer · Platform",
    location: "Remote",
    start: "Jan 2023",
    end: "Present",
    bullets: [
      "Owned the migration of the request-path from Kubernetes to Cloudflare Workers, cutting cold-start P99 by 78% and infrastructure cost by ~40%.",
      "Designed and shipped the per-request idempotency layer used by every customer-facing API; reduced duplicate-charge incidents to zero in the trailing 9 months.",
      "Mentored five engineers, including two who were promoted to senior during the period."
    ]
  },
  {
    company: "Brightline Systems",
    title: "Senior Engineer · Payments",
    location: "San Francisco, CA",
    start: "Mar 2019",
    end: "Dec 2022",
    bullets: [
      "Led the rollout of 3D-Secure 2.x across all card-acceptance flows; preserved approval rates while satisfying European SCA mandates.",
      "Built the fraud-rules engine used to evaluate ~12M transactions a day at peak with sub-50ms median latency.",
      "Designed the reconciliation pipeline that closes books to within $0.01 across 23 acquirers."
    ]
  },
  {
    company: "Halcyon",
    title: "Software Engineer",
    location: "Boston, MA",
    start: "Aug 2016",
    end: "Feb 2019",
    bullets: [
      "Shipped the first version of the bookings API now serving over 4M concurrent connections.",
      "Built the team's continuous deployment pipeline; cut release lead time from 8 days to under 30 minutes."
    ]
  }
];

const education = [
  {
    school: "University of California, Berkeley",
    degree: "B.A. Computer Science",
    detail: "Graduated 2016 · Departmental honors"
  }
];

const skills = [
  "TypeScript, Rust, Go",
  "Cloudflare Workers, AWS Lambda, Kubernetes",
  "PostgreSQL, Redis, ClickHouse",
  "OpenTelemetry, distributed tracing, SLO design",
  "Card-present and card-not-present payments, SCA/3DS, PSD2"
];

const doc = await PDFDocument.create();
const font = await doc.embedFont(StandardFonts.TimesRoman);
const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
const italic = await doc.embedFont(StandardFonts.TimesRomanItalic);
const theme = editorialTheme(font, bold, italic);

const PAGE_INNER = 515;
const BLUE = theme.colors.accent;

const header: Node = vstack(
  { gap: theme.spacing.xs },
  text(me.name, theme.type.display),
  text(me.title, { ...theme.type.h3, color: theme.colors.muted }),
  hstack(
    { width: PAGE_INNER, gap: theme.spacing.lg, margin: { top: theme.spacing.sm } },
    text(me.location, theme.type.bodySmall),
    link({ href: `mailto:${me.email}` }, text(me.email, { ...theme.type.bodySmall, color: BLUE, underline: true })),
    text(me.phone, theme.type.bodySmall),
    link({ href: `https://${me.website}` }, text(me.website, { ...theme.type.bodySmall, color: BLUE, underline: true }))
  )
);

const sectionTitle = (label: string): Node =>
  vstack(
    { width: PAGE_INNER, margin: { top: theme.spacing.lg } },
    text(label, { ...theme.type.h2, color: theme.colors.ink }),
    hline({ ...theme.hr, color: theme.colors.borderStrong, thickness: 1, margin: { top: 2, bottom: theme.spacing.sm } })
  );

const summarySection: Node = vstack(
  { width: PAGE_INNER, gap: theme.spacing.sm },
  sectionTitle("Summary"),
  text(summary, { ...theme.type.body, width: PAGE_INNER })
);

const bullet = (line: string): Node =>
  hstack(
    { width: PAGE_INNER - 12, gap: 8 },
    text("•", { ...theme.type.body, color: theme.colors.muted, width: 8 }),
    text(line, { ...theme.type.body, width: PAGE_INNER - 12 - 16 })
  );

const role = (r: Role): Node =>
  keepTogether(
    { gap: theme.spacing.xs, margin: { top: theme.spacing.md } },
    hstack(
      { width: PAGE_INNER, justify: "between" },
      vstack(
        { gap: 1 },
        text(r.title, { ...theme.type.h3, color: theme.colors.ink }),
        text(r.company + " · " + r.location, { ...theme.type.bodySmall, color: theme.colors.muted })
      ),
      text(`${r.start} — ${r.end}`, { ...theme.type.bodySmall, color: theme.colors.muted, align: "right", width: 160 })
    ),
    vstack({ gap: 4, margin: { top: theme.spacing.xs, left: 12 } }, ...r.bullets.map(bullet))
  );

const experienceSection: Node = vstack(
  { width: PAGE_INNER },
  sectionTitle("Experience"),
  ...experience.map(role)
);

const educationSection: Node = vstack(
  { width: PAGE_INNER },
  sectionTitle("Education"),
  ...education.map((ed) =>
    keepTogether(
      { gap: 2, margin: { top: theme.spacing.sm } },
      text(ed.school, { ...theme.type.h3, color: theme.colors.ink }),
      text(ed.degree, { ...theme.type.body, color: theme.colors.ink }),
      text(ed.detail, { ...theme.type.bodySmall, color: theme.colors.muted })
    )
  )
);

const skillsSection: Node = vstack(
  { width: PAGE_INNER },
  sectionTitle("Skills"),
  vstack(
    { gap: 4, margin: { top: theme.spacing.sm } },
    ...skills.map((s) => text(s, { ...theme.type.body, width: PAGE_INNER }))
  )
);

await renderFlow(
  doc,
  [header, summarySection, experienceSection, educationSection, skillsSection],
  {
    margin: theme.spacing.xxl,
    title: `${me.name} — Resume`,
    author: me.name,
    creator: "boxpdf",
    producer: "boxpdf"
  }
);

const bytes = await doc.save();
writeFileSync(new URL("../fixtures/resume.pdf", import.meta.url), bytes);
console.log(`wrote fixtures/resume.pdf (${bytes.byteLength} bytes)`);
