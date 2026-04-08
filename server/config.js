const config = {
  port: parseInt(process.env.PORT || '4051', 10),
  binding: process.env.BIND || '127.0.0.1',
  spineUrl: process.env.SPINE_URL || 'http://127.0.0.1:4000',
  tier: process.env.CORETEX_TIER || 'aos-src',
};

export default config;
