/**
 * Generate a clean, professional, ATS-friendly CV in Markdown
 * from a structured CV object. The output uses:
 * - Bold for section headings and job titles
 * - Italics for dates/subtitles
 * - Bullet points for accomplishments
 * - Defensive handling for missing or oddly-shaped fields
 * - Sanitization/escaping of Markdown-sensitive characters in user content
 *
 * Contract
 * - Input: structuredCV (object). If a string is provided, it's assumed to be Markdown
 *   and will be lightly sanitized and returned.
 * - Output: valid Markdown string
 * - Error modes: never throws for missing fields; gracefully skips invalid sections
 *
 * @example
 * import { generateMarkdownCV } from './generateMarkdownCV';
 * const md = generateMarkdownCV(structuredCV);
 * // md is a Markdown string ready for saving or PDF conversion
 */

/**
 * Escape Markdown-sensitive characters in user-provided text.
 * We control the markup (headings, bullets), so we escape content values.
 */
function removeControlChars(text) {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if ((code >= 0x00 && code <= 0x1F) || (code >= 0x7F && code <= 0x9F)) {
      continue; // skip control chars
    }
    out += text[i];
  }
  return out;
}

export function escapeMd(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  // Normalize whitespace and strip control chars
  const cleaned = removeControlChars(text).replace(/\s+/g, ' ').trim();
  // Escape markdown special characters that could break formatting
  // Do not escape hyphen or asterisk that we add for bullets; only inside content
  return cleaned
    .replace(/\\/g, '\\\\')      // backslash
    .replace(/`/g, '\\`')            // backtick
    .replace(/\*/g, '\\*')          // asterisk
    .replace(/_/g, '\\_')            // underscore
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/\[/g, '\\[')
    .replace(/]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/#/g, '\\#')
    .replace(/\+/g, '\\+')
    .replace(/\./g, '\\.')
    .replace(/!/g, '\\!')
    .replace(/\|/g, '\\|')
    .replace(/>/g, '\\>');
}

function isNonEmptyArray(v) {
  return Array.isArray(v) && v.length > 0;
}

function joinList(items, sep = ', ') {
  return items.map(escapeMd).filter(Boolean).join(sep);
}

function section(title) {
  // Per requirement: bold for headings
  return `**${escapeMd(title)}**\n\n`;
}

function formatContact(contact = {}) {
  const lines = [];
  const name = contact.name || contact.full_name;
  if (name) {
    // Name as a top emphasis line
    lines.push(`**${escapeMd(name)}**`);
  }
  const parts = [];
  if (contact.email) parts.push(escapeMd(contact.email));
  if (contact.phone) parts.push(escapeMd(contact.phone));
  if (contact.location) parts.push(escapeMd(contact.location));
  // Add links if present
  const links = [];
  if (contact.linkedin) links.push(escapeMd(contact.linkedin));
  if (contact.github) links.push(escapeMd(contact.github));
  if (contact.website) links.push(escapeMd(contact.website));
  if (links.length) parts.push(links.join(' · '));
  if (parts.length) lines.push(parts.join(' | '));
  return lines.join('\n');
}

function formatSummary(summary) {
  if (!summary) return '';
  return `${escapeMd(summary)}\n`;
}

function formatExperience(experience) {
  if (!isNonEmptyArray(experience)) return '';
  const out = [];
  out.push(section('Experience'));
  experience.forEach((exp) => {
    if (!exp) return;
    const title = exp.title ? `**${escapeMd(exp.title)}**` : '';
    const company = exp.company ? `, ${escapeMd(exp.company)}` : '';
    const date = exp.startDate || exp.start_date || exp.start || '';
    const end = exp.endDate || exp.end_date || exp.end || '';
    const dateSpan = date || end ? ` — *${escapeMd(`${date || ''}${date && end ? ' – ' : ''}${end || ''}`)}*` : '';
    const headline = [title, company].filter(Boolean).join('') + dateSpan;
    if (headline.trim()) out.push(`- ${headline}`);

    // Optional location/description as sub-bullets when present
    const subBullets = [];
    if (exp.location && exp.location !== 'Not provided') subBullets.push(escapeMd(exp.location));
    if (exp.description && exp.description !== 'Not provided') subBullets.push(escapeMd(exp.description));
    if (isNonEmptyArray(exp.bullets)) {
      exp.bullets.forEach((b) => {
        if (b) subBullets.push(escapeMd(b));
      });
    }
    if (subBullets.length) {
      subBullets.forEach((b) => out.push(`  - ${b}`));
    }
  });
  out.push('');
  return out.join('\n') + '\n';
}

function formatEducation(education) {
  if (!isNonEmptyArray(education)) return '';
  const out = [];
  out.push(section('Education'));
  education.forEach((edu) => {
    if (!edu) return;
    const degree = edu.degree ? `**${escapeMd(edu.degree)}**` : '';
    const institution = edu.institution ? `, ${escapeMd(edu.institution)}` : '';
    const date = edu.startDate || edu.start || '';
    const end = edu.endDate || edu.end || '';
    const dateSpan = date || end ? ` — *${escapeMd(`${date || ''}${date && end ? ' – ' : ''}${end || ''}`)}*` : '';
    const headline = [degree, institution].filter(Boolean).join('') + dateSpan;
    if (headline.trim()) out.push(`- ${headline}`);

    const details = [];
    if (edu.gpa) details.push(`GPA: ${escapeMd(edu.gpa)}`);
    if (edu.description && edu.description !== 'Not provided') details.push(escapeMd(edu.description));
    if (details.length) details.forEach((d) => out.push(`  - ${d}`));
  });
  out.push('');
  return out.join('\n') + '\n';
}

function formatSkills(skills) {
  if (!skills || typeof skills !== 'object' || !Object.keys(skills).length) return '';
  const out = [];
  out.push(section('Skills'));
  Object.entries(skills).forEach(([cat, items]) => {
    if (!isNonEmptyArray(items)) return;
    const displayName = cat
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    out.push(`- ${escapeMd(displayName)}: ${joinList(items)}`);
  });
  out.push('');
  return out.join('\n') + '\n';
}

function formatProjects(projects) {
  if (!isNonEmptyArray(projects)) return '';
  const out = [];
  out.push(section('Projects'));
  projects.forEach((p) => {
    if (!p) return;
    const name = p.name ? `**${escapeMd(p.name)}**` : '';
    const date = p.startDate || p.start || '';
    const end = p.endDate || p.end || '';
    const dateSpan = date || end ? ` — *${escapeMd(`${date || ''}${date && end ? ' – ' : ''}${end || ''}`)}*` : '';
    const header = `- ${name}${dateSpan}`.trim();
    if (name) out.push(header);
    if (p.description && p.description !== 'Not provided') out.push(`  - ${escapeMd(p.description)}`);
    if (isNonEmptyArray(p.technologies)) out.push(`  - Technologies: ${joinList(p.technologies)}`);
  });
  out.push('');
  return out.join('\n') + '\n';
}

function formatCertifications(certifications) {
  if (!isNonEmptyArray(certifications)) return '';
  const out = [];
  out.push(section('Certifications'));
  certifications.forEach((c) => {
    if (!c) return;
    const name = c.name ? `**${escapeMd(c.name)}**` : '';
    const issuer = c.issuer ? `, ${escapeMd(c.issuer)}` : '';
    const date = c.date ? ` — *${escapeMd(c.date)}*` : '';
    if (name) out.push(`- ${name}${issuer}${date}`);
  });
  out.push('');
  return out.join('\n') + '\n';
}

function formatActivities(activities) {
  if (!isNonEmptyArray(activities)) return '';
  const out = [];
  out.push(section('Activities & Associations'));
  activities.forEach((a) => {
    if (!a) return;
    const org = a.organization ? `**${escapeMd(a.organization)}**` : '';
    const title = a.title ? `, ${escapeMd(a.title)}` : '';
    const date = a.startDate || a.start || '';
    const end = a.endDate || a.end || '';
    const dateSpan = date || end ? ` — *${escapeMd(`${date || ''}${date && end ? ' – ' : ''}${end || ''}`)}*` : '';
    const header = `- ${org}${title}${dateSpan}`.trim();
    if (org) out.push(header);
    if (a.description && a.description !== 'Not provided') out.push(`  - ${escapeMd(a.description)}`);
  });
  out.push('');
  return out.join('\n') + '\n';
}

function formatVolunteer(volunteer) {
  if (!isNonEmptyArray(volunteer)) return '';
  const out = [];
  out.push(section('Volunteer Experience'));
  volunteer.forEach((v) => {
    if (!v) return;
    const org = v.organization ? `**${escapeMd(v.organization)}**` : '';
    const role = v.role ? `, ${escapeMd(v.role)}` : '';
    const date = v.startDate || v.start || '';
    const end = v.endDate || v.end || '';
    const dateSpan = date || end ? ` — *${escapeMd(`${date || ''}${date && end ? ' – ' : ''}${end || ''}`)}*` : '';
    const header = `- ${org}${role}${dateSpan}`.trim();
    if (org) out.push(header);
    if (v.description && v.description !== 'Not provided') out.push(`  - ${escapeMd(v.description)}`);
  });
  out.push('');
  return out.join('\n') + '\n';
}

function formatOtherSections(other) {
  if (!other || typeof other !== 'object' || !Object.keys(other).length) return '';
  const out = [];
  Object.entries(other).forEach(([key, value]) => {
    if (!value) return;
    const display = key
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    out.push(section(display));
    // Handle arrays of strings or objects
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item == null) return;
        if (typeof item === 'string') {
          const txt = escapeMd(item);
          if (txt) out.push(`- ${txt}`);
        } else if (typeof item === 'object') {
          // Try common shapes
          const content = item.content || item.text || item.title || '';
          const sub = item.subtitle || item.note || '';
          const date = item.date || '';
          const header = [content ? `**${escapeMd(content)}**` : '', sub ? `, ${escapeMd(sub)}` : '']
            .filter(Boolean)
            .join('');
          const line = header || content ? `- ${header}${date ? ` — *${escapeMd(date)}*` : ''}` : '';
          if (line) out.push(line);
        }
      });
    } else if (typeof value === 'string') {
      const txt = escapeMd(value);
      if (txt) out.push(`- ${txt}`);
    } else if (typeof value === 'object') {
      // Key-value list
      Object.entries(value).forEach(([k, v]) => {
        const line = `${escapeMd(k)}: ${escapeMd(v)}`;
        out.push(`- ${line}`);
      });
    }
    out.push('');
  });
  return out.join('\n') + '\n';
}

export function generateMarkdownCV(structuredCV) {
  if (structuredCV == null) return '';
  // If a string is passed, assume it's already Markdown and lightly sanitize
  if (typeof structuredCV === 'string') {
    return escapeMd(structuredCV)
      // Permit existing headings/bullets: unescape our added escapes for leading "#" and "- " patterns
      .replace(/^\\#\s/gm, '# ')
      .replace(/^\\-\s/gm, '- ');
  }

  const cv = structuredCV || {};
  const lines = [];

  // Contact + Summary at top
  const contactBlock = formatContact(cv.contact || cv.contacts || {});
  if (contactBlock) {
    lines.push(contactBlock, '');
  }
  const summary = cv.summary || cv.objective || '';
  if (summary) {
    lines.push(section('Summary'));
    lines.push(formatSummary(summary), '');
  }

  // Core sections
  lines.push(
    formatExperience(cv.experience),
    formatEducation(cv.education),
    formatSkills(cv.skills),
    formatProjects(cv.projects),
    formatCertifications(cv.certifications)
  );

  // Additional sections
  lines.push(
    formatActivities(cv.activities),
    formatVolunteer(cv.volunteer),
    formatOtherSections(cv.other_sections)
  );

  // Final assembly: remove successive blank lines
  const md = lines
    .filter((x) => typeof x === 'string')
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n';

  return md;
}

export default generateMarkdownCV;
