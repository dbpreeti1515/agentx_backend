import React, { useMemo } from "react";
import { Users, CircleDollarSign, PhoneCall, Building2 } from "lucide-react";

function getProspectsFromConversation(conversation = []) {
  const userMessages = conversation.filter((m) => m.role === "user");

  if (!userMessages.length) {
    return [
      {
        id: "seed-1",
        name: "Northstar Logistics",
        contact: "Anita Rao",
        stage: "Qualified",
        value: "$24,000",
      },
      {
        id: "seed-2",
        name: "Vertex Health",
        contact: "Chris Moore",
        stage: "Discovery",
        value: "$18,500",
      },
      {
        id: "seed-3",
        name: "BluePeak Retail",
        contact: "Rohan Singh",
        stage: "Proposal",
        value: "$31,000",
      },
    ];
  }

  return userMessages.slice(-6).map((message, index) => ({
    id: message.id || `prospect-${index}`,
    name: `Lead ${index + 1}`,
    contact: "Inbound Contact",
    stage: index % 2 === 0 ? "Discovery" : "Qualified",
    value: `$${(12000 + index * 3500).toLocaleString()}`,
    note: message.content,
  }));
}

export function SalesProspectsPage({ conversation = [] }) {
  const prospects = useMemo(
    () => getProspectsFromConversation(conversation),
    [conversation]
  );

  return (
    <div className="space-y-8">
      <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Sales Prospects
            </h2>
            <p className="text-slate-500 font-medium mt-2">
              Track active leads and prioritize next outreach.
            </p>
          </div>
          <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black uppercase tracking-widest">
            {prospects.length} Active Leads
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-white border border-slate-200 rounded-3xl p-6">
          <div className="flex items-center gap-3 text-slate-600">
            <Users size={18} />
            <p className="text-xs font-black uppercase tracking-widest">Pipeline</p>
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900">{prospects.length}</p>
          <p className="text-sm text-slate-500 font-medium">Open opportunities</p>
        </section>

        <section className="bg-white border border-slate-200 rounded-3xl p-6">
          <div className="flex items-center gap-3 text-slate-600">
            <CircleDollarSign size={18} />
            <p className="text-xs font-black uppercase tracking-widest">Forecast</p>
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900">$73.5K</p>
          <p className="text-sm text-slate-500 font-medium">Estimated close value</p>
        </section>

        <section className="bg-white border border-slate-200 rounded-3xl p-6">
          <div className="flex items-center gap-3 text-slate-600">
            <PhoneCall size={18} />
            <p className="text-xs font-black uppercase tracking-widest">Follow-up</p>
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900">5</p>
          <p className="text-sm text-slate-500 font-medium">Due today</p>
        </section>
      </div>

      <section className="bg-white border border-slate-200 rounded-3xl p-5">
        <div className="mb-4 px-1 flex items-center gap-2 text-slate-500">
          <Building2 size={16} />
          <p className="text-xs font-black uppercase tracking-widest">Lead List</p>
        </div>

        <div className="space-y-3">
          {prospects.map((prospect) => (
            <article
              key={prospect.id}
              className="border border-slate-200 rounded-2xl p-4 bg-slate-50"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">{prospect.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Contact: {prospect.contact}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest">
                    {prospect.stage}
                  </span>
                  <span className="text-xs font-black text-emerald-700">
                    {prospect.value}
                  </span>
                </div>
              </div>
              {prospect.note ? (
                <p className="mt-3 text-xs text-slate-600 font-medium line-clamp-2">
                  {prospect.note}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
