import { motion } from 'framer-motion';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';

const About = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header className="modern-header">
        <div className="container">
          <TopBar onMenuToggle={() => {}} />
        </div>
      </header>

      {/* Hero / Intro */}
      <section className="container py-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="row align-items-center"
        >
          <div className="col-lg-7 mb-4 mb-lg-0">
            <h1 className="fw-bold mb-3" style={{ color: '#111827' }}>
              About <span style={{ color: '#f26522' }}>Kids Colours</span>
            </h1>
            <p className="lead" style={{ color: '#4b5563' }}>
              Kids Colours is a fast‑growing, loved kidswear brand that has been dressing happy kids
              since <strong>2017</strong>. We blend playful design, premium fabrics and parent‑approved
              quality to create outfits children actually want to wear – every single day.
            </p>
          </div>
          <div className="col-lg-5">
            <div
              className="p-4 rounded-4 shadow-sm"
              style={{
                background:
                  'linear-gradient(135deg, rgba(242,101,34,0.1), rgba(251,191,36,0.15))',
              }}
            >
              <h5 className="fw-bold mb-3" style={{ color: '#111827' }}>
                At a Glance
              </h5>
              <ul className="list-unstyled mb-0" style={{ color: '#374151', fontSize: 14 }}>
                <li className="mb-2">
                  • Founded in <strong>2017</strong> with a simple idea: colourful, comfortable fashion
                  for kids.
                </li>
                <li className="mb-2">
                  • Thousands of happy parents who trust our fits, fabrics and fast delivery.
                </li>
                <li className="mb-2">
                  • Carefully curated collections for everyday wear, occasions and gifting.
                </li>
                <li>
                  • Based in Pakistan, serving customers nationwide through our online store.
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Brand Story */}
      <section className="container pb-5">
        <div className="row">
          <div className="col-lg-7 mb-4">
            <h3 className="fw-bold mb-3" style={{ color: '#111827' }}>
              Our Story
            </h3>
            <p style={{ color: '#4b5563', lineHeight: 1.7 }}>
              Kids Colours started in 2017 as a small passion project to bring better kidswear to
              local families. We saw parents struggling to choose between boring designs and low
              quality, so we decided to build a brand that does both – <strong>style</strong> and{' '}
              <strong>substance</strong>.
            </p>
            <p style={{ color: '#4b5563', lineHeight: 1.7 }}>
              Today, Kids Colours is a recognised name in kids fashion with a strong online presence,
              fresh drops every season and a loyal customer base that keeps coming back. From playful
              graphics to soft cotton basics, every piece is designed to handle real‑life: school,
              playdates, birthdays and everything in between.
            </p>
          </div>
          <div className="col-lg-5 mb-4">
            <div className="p-4 rounded-4 bg-white shadow-sm h-100">
              <h4 className="fw-bold mb-3" style={{ color: '#111827' }}>
                What Makes Us Different?
              </h4>
              <ul className="list-unstyled mb-0" style={{ color: '#4b5563', fontSize: 14 }}>
                <li className="mb-2">
                  • <strong>Comfort‑first fabrics</strong> – soft, breathable and kid‑friendly.
                </li>
                <li className="mb-2">
                  • <strong>Trendy yet age‑appropriate</strong> designs that parents approve.
                </li>
                <li className="mb-2">
                  • <strong>Honest pricing</strong> – premium look and feel without premium pricing.
                </li>
                <li>
                  • <strong>Responsive support</strong> – we actually listen, improve and grow with
                  our customers.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Vision / Mission */}
      <section
        className="py-5"
        style={{ background: 'linear-gradient(135deg,#0f172a,#020617)', color: '#e5e7eb' }}
      >
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6">
              <h3 className="fw-bold mb-3">Our Vision</h3>
              <p style={{ lineHeight: 1.7 }}>
                To be the most loved kids fashion brand in Pakistan – a brand that children are
                excited to wear and parents confidently recommend.
              </p>
            </div>
            <div className="col-md-6">
              <h3 className="fw-bold mb-3">Our Promise</h3>
              <p style={{ lineHeight: 1.7 }}>
                Every order from Kids Colours should feel like a good decision: from product quality
                to packaging, delivery experience and after‑sales support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <ThemeFooter />
    </div>
  );
};

export default About;


