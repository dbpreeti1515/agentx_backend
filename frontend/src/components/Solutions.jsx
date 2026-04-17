import React from "react";
import {
  FileText,
  Mail,
  MessageSquareText,
  CalendarCheck2,
  ClipboardList,
  IndianRupee,
  TimerReset,
  Bot,
  CheckCircle2,
} from "lucide-react";

export const Solutions = () => {
  const solutions = [
    {
      icon: MessageSquareText,
      title: "Meeting Notes Automation",
      description:
        "Automatically capture meeting discussions, extract key points, action items, and next steps without manual note-taking.",
    },
    {
      icon: FileText,
      title: "Auto Proposal Generation",
      description:
        "Generate structured project proposals with scope, deliverables, and summaries based on client conversations and requirements.",
    },
    {
      icon: Mail,
      title: "Smart Email Drafting",
      description:
        "Draft follow-up emails, proposal emails, requirement clarification emails, and client updates in seconds with the right tone.",
    },
    {
      icon: ClipboardList,
      title: "Requirement Specification",
      description:
        "Convert raw client discussions into clear requirement documents, user stories, feature lists, and project specifications.",
    },
    {
      icon: TimerReset,
      title: "Timeline Estimation",
      description:
        "Suggest realistic delivery timelines based on project scope, complexity, team size, and implementation requirements.",
    },
    {
      icon: IndianRupee,
      title: "Budget Planning",
      description:
        "Help sales and pre-sales teams estimate pricing ranges, effort breakdowns, and budget-sensitive recommendations.",
    },
    {
      icon: Bot,
      title: "AI Chat Assistance",
      description:
        "Use an AI assistant to answer queries, refine requirements, suggest improvements, and guide the team through pre-sales tasks.",
    },
    {
      icon: CalendarCheck2,
      title: "Client Discussion Tracking",
      description:
        "Keep all discussion history, decisions, approvals, and pending clarifications organized in one place for the whole team.",
    },
    {
      icon: CheckCircle2,
      title: "Decision-Ready Insights",
      description:
        "Get instant recommendations on missing details, risky assumptions, unclear features, and the next best action to move the deal forward.",
    },
  ];

  return (
    <section id="solutions" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-sm mb-6">
            Platform Solutions
          </span>

          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-5">
            Everything your sales and pre-sales team needs to close faster
          </h2>

          <p className="text-lg text-slate-600 leading-relaxed">
            From client meetings to requirement analysis, proposal creation,
            email drafting, timeline estimation, and budget planning — the
            platform helps your team remove manual work and make better decisions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {solutions.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="group bg-white rounded-3xl border border-slate-200 p-7 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 mb-5">
                  <Icon size={26} />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {item.title}
                </h3>

                <p className="text-slate-600 leading-relaxed text-sm">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};