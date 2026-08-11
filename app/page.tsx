"use client";

import { useState } from "react";

export default function Home() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`New inquiry from ${formData.name} - ${formData.company}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nCompany: ${formData.company}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:thomasdisney7@gmail.com?subject=${subject}&body=${body}`;
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="text-xl font-bold text-gray-900">AutomateAI</div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-600 hover:text-gray-900 transition-colors">Home</a>
              <a href="#services" className="text-gray-600 hover:text-gray-900 transition-colors">Services</a>
              <a href="#process" className="text-gray-600 hover:text-gray-900 transition-colors">Process</a>
              <a href="#case-studies" className="text-gray-600 hover:text-gray-900 transition-colors">Case Studies</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</a>
              <a href="#contact" className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              AI Automations That Save Time and{" "}
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Increase Revenue
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Transform your small business with custom AI automation solutions. Streamline operations, boost productivity, and scale efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="bg-blue-600 text-white px-8 py-4 rounded-full hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg shadow-blue-600/30"
              >
                Book a Free Automation Audit
              </a>
              <a
                href="#case-studies"
                className="bg-gray-100 text-gray-900 px-8 py-4 rounded-full hover:bg-gray-200 transition-colors font-semibold text-lg"
              >
                See Examples
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-600 mb-8 font-medium">Trusted by small businesses</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-40">
            <svg className="h-8" viewBox="0 0 120 40" fill="currentColor">
              <text x="10" y="25" fontFamily="Arial" fontSize="20" fontWeight="bold">TechCo</text>
            </svg>
            <svg className="h-8" viewBox="0 0 120 40" fill="currentColor">
              <text x="10" y="25" fontFamily="Arial" fontSize="20" fontWeight="bold">GrowthLab</text>
            </svg>
            <svg className="h-8" viewBox="0 0 120 40" fill="currentColor">
              <text x="10" y="25" fontFamily="Arial" fontSize="20" fontWeight="bold">FlexSales</text>
            </svg>
            <svg className="h-8" viewBox="0 0 120 40" fill="currentColor">
              <text x="10" y="25" fontFamily="Arial" fontSize="20" fontWeight="bold">DataPro</text>
            </svg>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive AI automation solutions tailored to your business needs
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Lead Capture + CRM",
                description: "Automatically capture, qualify, and organize leads from multiple channels into your CRM system.",
                icon: "📊"
              },
              {
                title: "Follow-up Sequences",
                description: "Intelligent email and SMS sequences that nurture leads and drive conversions automatically.",
                icon: "📧"
              },
              {
                title: "AI Chat & Voice Assistants",
                description: "24/7 customer support with AI-powered chatbots and voice assistants that sound human.",
                icon: "💬"
              },
              {
                title: "Reporting Dashboards",
                description: "Real-time business intelligence dashboards that turn your data into actionable insights.",
                icon: "📈"
              },
              {
                title: "Document Automation",
                description: "Generate contracts, invoices, and reports automatically from your existing data.",
                icon: "📄"
              },
              {
                title: "Integrations",
                description: "Seamlessly connect Google Workspace, Slack, HubSpot, Salesforce, and 100+ other tools.",
                icon: "🔗"
              }
            ].map((service, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="py-24 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Our Process</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A proven approach to delivering automation solutions that work
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {[
                {
                  number: "01",
                  title: "Discover",
                  description: "We analyze your workflows, identify bottlenecks, and uncover automation opportunities that will have the biggest impact."
                },
                {
                  number: "02",
                  title: "Build",
                  description: "Our team designs and develops custom automation solutions using best-in-class AI and integration technologies."
                },
                {
                  number: "03",
                  title: "Launch",
                  description: "We deploy your automations, train your team, and ensure everything works perfectly from day one."
                },
                {
                  number: "04",
                  title: "Optimize",
                  description: "Continuous monitoring and improvement to maximize ROI and adapt to your evolving business needs."
                }
              ].map((step, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                      {step.number}
                    </div>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section id="case-studies" className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Case Studies</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real results from businesses like yours
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                company: "TechCo Solutions",
                industry: "B2B SaaS",
                metrics: ["78% faster lead response", "3x conversion rate", "$120K annual savings"],
                results: [
                  "Automated lead qualification system",
                  "AI-powered email sequences",
                  "Slack integration for instant notifications",
                  "Custom CRM dashboard"
                ]
              },
              {
                company: "GrowthLab Marketing",
                industry: "Agency",
                metrics: ["50+ hours saved/month", "95% client satisfaction", "2x team capacity"],
                results: [
                  "Automated client reporting system",
                  "AI content generation workflows",
                  "Project management automation",
                  "Invoice and payment tracking"
                ]
              },
              {
                company: "FlexSales Inc",
                industry: "E-commerce",
                metrics: ["40% more qualified leads", "$200K revenue increase", "24/7 availability"],
                results: [
                  "AI chatbot for product recommendations",
                  "Automated abandoned cart recovery",
                  "Customer support ticket routing",
                  "Inventory management integration"
                ]
              }
            ].map((study, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-shadow">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{study.company}</h3>
                <p className="text-blue-600 font-medium mb-6">{study.industry}</p>
                <div className="space-y-3 mb-6">
                  {study.metrics.map((metric, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg px-4 py-3">
                      <p className="text-gray-900 font-semibold">{metric}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-6">
                  <p className="text-sm font-semibold text-gray-900 mb-3">What we built:</p>
                  <ul className="space-y-2">
                    {study.results.map((result, idx) => (
                      <li key={idx} className="text-gray-600 text-sm flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>{result}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your business needs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Starter",
                price: "$1,499",
                period: "/month",
                popular: false,
                features: [
                  "1 automation workflow",
                  "Up to 5 integrations",
                  "Email support",
                  "Monthly reporting",
                  "Basic AI chatbot"
                ]
              },
              {
                name: "Growth",
                price: "$3,999",
                period: "/month",
                popular: true,
                features: [
                  "Up to 5 automation workflows",
                  "Unlimited integrations",
                  "Priority support",
                  "Weekly reporting & optimization",
                  "Advanced AI assistants",
                  "Custom dashboard"
                ]
              },
              {
                name: "Pro",
                price: "$7,999",
                period: "/month",
                popular: false,
                features: [
                  "Unlimited automation workflows",
                  "Unlimited integrations",
                  "Dedicated account manager",
                  "Daily monitoring & optimization",
                  "White-label solutions",
                  "API access",
                  "Custom development"
                ]
              }
            ].map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-8 ${
                  plan.popular ? "ring-2 ring-blue-600 shadow-xl relative" : "border border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="text-gray-600 flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className={`block w-full text-center py-3 rounded-full font-semibold transition-colors ${
                    plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  Get Started
                </a>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 mt-12">
            Need something custom?{" "}
            <a href="#contact" className="text-blue-600 font-semibold hover:text-blue-700">
              Contact us for enterprise pricing
            </a>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            {[
              {
                question: "How long does implementation take?",
                answer: "Most automation projects take 2-4 weeks from discovery to launch. Simple workflows can be deployed in as little as 1 week, while complex multi-system integrations may take 6-8 weeks."
              },
              {
                question: "Do I need technical knowledge to use the automations?",
                answer: "No technical knowledge required! We design all automations to be user-friendly and provide complete training for your team. Most solutions work seamlessly in the background without any manual intervention."
              },
              {
                question: "What if I need changes after launch?",
                answer: "All plans include ongoing support and optimization. You can request changes anytime, and we'll adjust your automations as your business evolves. Growth and Pro plans include proactive monthly optimizations."
              },
              {
                question: "Can you integrate with our existing tools?",
                answer: "Yes! We work with 100+ platforms including Google Workspace, Microsoft 365, Slack, HubSpot, Salesforce, Shopify, and more. If a tool has an API, we can integrate it."
              },
              {
                question: "What kind of ROI can we expect?",
                answer: "Our clients typically see 10-20 hours saved per week per employee, 40-80% faster response times, and 2-3x improvements in conversion rates. Most businesses achieve full ROI within 3-6 months."
              },
              {
                question: "Is our data secure?",
                answer: "Absolutely. We follow enterprise-grade security practices, use encrypted connections for all integrations, and never store sensitive data on our servers. We're happy to sign NDAs and work within your security requirements."
              },
              {
                question: "Can we cancel anytime?",
                answer: "Yes, all plans are month-to-month with no long-term contracts. We believe in earning your business every month through exceptional results and service."
              },
              {
                question: "Do you offer custom solutions?",
                answer: "Yes! While our plans cover most needs, we also build fully custom automation solutions for unique business requirements. Contact us to discuss your specific use case."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Get Started Today</h2>
            <p className="text-xl text-gray-600">
              Book your free automation audit and discover how AI can transform your business
            </p>
          </div>
          {formSubmitted ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Thank You!</h3>
              <p className="text-gray-600 mb-6">
                Your message has been sent. We'll get back to you within 24 hours.
              </p>
              <button
                onClick={() => setFormSubmitted(false)}
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-semibold text-gray-900 mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    id="company"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="Your Company Inc."
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Tell us about your business and what you'd like to automate..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 rounded-full hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg shadow-blue-600/30"
                >
                  Send Message
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="text-2xl font-bold mb-2">AutomateAI</div>
              <p className="text-gray-400">
                <a href="mailto:thomasdisney7@gmail.com" className="hover:text-white transition-colors">
                  thomasdisney7@gmail.com
                </a>
              </p>
            </div>
            <div className="flex gap-8 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} AutomateAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
