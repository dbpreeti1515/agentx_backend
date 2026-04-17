import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export const Pricing = ({ onLaunchDashboard }) => {
  const plans = [
    {
      name: "Starter",
      price: "₹999",
      desc: "Best for individuals getting started",
      features: [
        "1 AI Sales Agent",
        "Basic CRM Insights",
        "Meeting Tracking",
        "Email Support",
      ],
      highlight: false,
    },
    {
      name: "Pro",
      price: "₹2,499",
      desc: "For growing sales teams",
      features: [
        "5 AI Sales Agents",
        "Advanced Analytics",
        "Real-time Recommendations",
        "Priority Support",
      ],
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "For large organizations",
      features: [
        "Unlimited Agents",
        "Custom Workflows",
        "Dedicated Manager",
        "24/7 Support",
      ],
      highlight: false,
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-black text-slate-900 mb-4"
        >
          Simple, Transparent Pricing
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-slate-600 text-lg mb-16"
        >
          Choose a plan that fits your sales growth
        </motion.p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.03 }}
              transition={{ duration: 0.35 }}
              className={`rounded-3xl p-8 border transition-all ${
                plan.highlight
                  ? "bg-indigo-600 text-white shadow-2xl scale-105"
                  : "bg-white border-slate-200"
              }`}
            >
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>

              <p
                className={`text-sm mb-6 ${
                  plan.highlight ? "text-indigo-100" : "text-slate-500"
                }`}
              >
                {plan.desc}
              </p>

              <div className="text-4xl font-black mb-6">
                {plan.price}
                {plan.price !== "Custom" && (
                  <span className="text-base font-medium"> /month</span>
                )}
              </div>

              <ul className="space-y-3 mb-8 text-left">
                {plan.features.map((f, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="flex items-center gap-2"
                  >
                    <Check size={16} />
                    <span className="text-sm">{f}</span>
                  </motion.li>
                ))}
              </ul>

              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                onClick={onLaunchDashboard}
                className={`w-full py-3 rounded-xl font-semibold transition ${
                  plan.highlight
                    ? "bg-white text-indigo-600 hover:bg-gray-100"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                Get Started
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};