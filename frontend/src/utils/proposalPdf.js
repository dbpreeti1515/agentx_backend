import { jsPDF } from "jspdf";

function toBulletLines(value) {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.filter(Boolean).map(String);
  }
  if (typeof value === "string") {
    return value.trim() ? [value.trim()] : [];
  }
  return Object.entries(value)
    .filter(([, item]) => {
      if (Array.isArray(item)) {
        return item.length > 0;
      }
      return Boolean(item);
    })
    .map(([key, item]) => `${key}: ${Array.isArray(item) ? item.join(", ") : String(item)}`);
}

function drawSection(doc, ctx, title, items) {
  const lines = toBulletLines(items);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(title, ctx.margin, ctx.y);
  ctx.y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  if (!lines.length) {
    doc.text("- Not enough information captured yet.", ctx.margin, ctx.y);
    ctx.y += 7;
    return;
  }

  lines.forEach((line) => {
    const wrapped = doc.splitTextToSize(`- ${line}`, ctx.width);
    if (ctx.y + wrapped.length * 5 > 285) {
      doc.addPage();
      ctx.y = 18;
    }
    doc.text(wrapped, ctx.margin, ctx.y);
    ctx.y += wrapped.length * 5 + 1;
  });
  ctx.y += 2;
}

export function buildProposalPdf({ sessionId, proposal, requirements = {}, risks = [], missingInfo = [], suggestions = [] }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ctx = { margin: 14, width: 182, y: 18 };
  const generatedAt = new Date().toLocaleString();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("AgentX Proposal Deck", ctx.margin, ctx.y);
  ctx.y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text(`Generated: ${generatedAt}`, ctx.margin, ctx.y);
  ctx.y += 4.5;
  doc.text(`Session: ${sessionId || "N/A"}`, ctx.margin, ctx.y);
  ctx.y += 8;

  drawSection(doc, ctx, "Executive Summary", [
    proposal?.executiveSummary || proposal?.proposalText || requirements?.projectSummary || "Draft generated from current context.",
  ]);
  drawSection(doc, ctx, "Objectives", requirements?.objectives);
  drawSection(doc, ctx, "Target Audience", requirements?.targetAudience);
  drawSection(doc, ctx, "Scope & Deliverables", [
    ...(proposal?.scope || []),
    ...(proposal?.deliverables || []),
    ...(requirements?.deliverables || []),
  ]);
  drawSection(doc, ctx, "Timeline", [...(proposal?.timeline || []), requirements?.timeline]);
  drawSection(doc, ctx, "Budget", [requirements?.budget, proposal?.pricing?.model, ...(proposal?.pricing?.details || [])]);
  drawSection(doc, ctx, "Constraints & Risks", [...(requirements?.technicalConstraints || []), ...(risks || [])]);
  drawSection(doc, ctx, "Missing Information", missingInfo || []);
  drawSection(doc, ctx, "Recommendations", [...(suggestions || []), ...(proposal?.nextSteps || [])]);

  if (proposal?.proposalText) {
    if (ctx.y > 250) {
      doc.addPage();
      ctx.y = 18;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Full Proposal Narrative", ctx.margin, ctx.y);
    ctx.y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const wrapped = doc.splitTextToSize(proposal.proposalText, ctx.width);
    doc.text(wrapped, ctx.margin, ctx.y);
  }

  const safeSession = (sessionId || "proposal").replace(/[^a-z0-9-_]/gi, "");
  const filename = `AgentX-Proposal-${safeSession || "deck"}.pdf`;
  const dataUri = doc.output("datauristring");
  return { filename, dataUri, generatedAt };
}
