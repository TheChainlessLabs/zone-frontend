// Figma Script: Landing Page Redesign
// Usage: Paste this entire script into Figma's Dev Console (Cmd+Option+K on Mac, Ctrl+Shift+K on Windows)
// Target File: https://www.figma.com/design/5zleH9uaqwwwXie6mlcc4m/Impeccable-Iterations

const page = figma.currentPage;
const frameWidth = 1440;

const mainFrame = figma.createAutoLayout('VERTICAL', {
  name: 'Landing Page - Redesign',
  itemSpacing: 0
});

mainFrame.set({
  fills: [{ type: 'SOLID', color: { r: 0.04, g: 0.04, b: 0.05 } }]
});

// Navbar
const navbar = figma.createAutoLayout('HORIZONTAL', {
  name: 'Navbar',
  itemSpacing: 0
});
navbar.resize(frameWidth, 80);
navbar.set({
  fills: [{ type: 'SOLID', color: { r: 0.04, g: 0.04, b: 0.05 }, opacity: 0.9 }],
  strokes: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.1 }]
});

const navText = figma.createText();
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
navText.characters = 'Omega Markets     Fund  •  Design Partner  •  Research';
navText.fontSize = 14;
navText.fontName = { family: 'Inter', style: 'Regular' };
navText.set({ fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }] });
navbar.appendChild(navText);
mainFrame.appendChild(navbar);

// Hero + Differentiators
const heroSection = figma.createAutoLayout('VERTICAL', {
  name: 'Hero + Differentiators',
  itemSpacing: 40
});
heroSection.set({
  fills: [{ type: 'SOLID', color: { r: 0.04, g: 0.04, b: 0.05 } }],
  paddingLeft: 60,
  paddingRight: 60,
  paddingTop: 100,
  paddingBottom: 100
});

const heroHeadline = figma.createText();
await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
heroHeadline.characters = 'The private price discovery zone for stablecoin FX.';
heroHeadline.fontSize = 64;
heroHeadline.fontName = { family: 'Inter', style: 'Semi Bold' };
heroHeadline.lineHeight = { unit: 'PERCENT_LINE_HEIGHT', value: 110 };
heroHeadline.set({ fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }] });
heroSection.appendChild(heroHeadline);

const heroSupporting = figma.createText();
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
heroSupporting.characters = 'Omega is a payments-focused dark book where makers and takers can discover price without exposing flow before execution.';
heroSupporting.fontSize = 18;
heroSupporting.fontName = { family: 'Inter', style: 'Regular' };
heroSupporting.set({ fills: [{ type: 'SOLID', color: { r: 0.63, g: 0.63, b: 0.67 } }] });
heroSection.appendChild(heroSupporting);

const diffHeader = figma.createText();
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
diffHeader.characters = 'Key Differentiators (to be added)';
diffHeader.fontSize = 14;
diffHeader.fontName = { family: 'Inter', style: 'Regular' };
diffHeader.set({ fills: [{ type: 'SOLID', color: { r: 0.63, g: 0.63, b: 0.67 } }] });
heroSection.appendChild(diffHeader);
mainFrame.appendChild(heroSection);

// Scroll Teaser
const teaser = figma.createAutoLayout('VERTICAL', {
  name: 'Scroll Teaser',
  itemSpacing: 20
});
teaser.set({
  fills: [{ type: 'SOLID', color: { r: 0.04, g: 0.04, b: 0.05 } }],
  paddingLeft: 60,
  paddingRight: 60,
  paddingTop: 40,
  paddingBottom: 40
});

const teaserText = figma.createText();
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
teaserText.characters = '↓ Scroll to see how orders flow through Omega ↓';
teaserText.fontSize = 16;
teaserText.fontName = { family: 'Inter', style: 'Regular' };
teaserText.set({ fills: [{ type: 'SOLID', color: { r: 0.63, g: 0.63, b: 0.67 } }] });
teaser.appendChild(teaserText);
mainFrame.appendChild(teaser);

// Who/Why Panels
const whoWhySection = figma.createAutoLayout('HORIZONTAL', {
  name: 'Who / Why',
  itemSpacing: 40
});
whoWhySection.set({
  paddingLeft: 60,
  paddingRight: 60,
  paddingTop: 100,
  paddingBottom: 100
});

const whoPanel = figma.createAutoLayout('VERTICAL', {
  name: 'Who is Omega',
  itemSpacing: 20
});
whoPanel.resize(frameWidth / 2 - 20, 300);
whoPanel.set({ fills: [{ type: 'SOLID', color: { r: 0.15, g: 0.15, b: 0.16 }, opacity: 0.5 }], cornerRadius: 12, paddingLeft: 32, paddingRight: 32, paddingTop: 32, paddingBottom: 32 });

const whoTitle = figma.createText();
await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
whoTitle.characters = 'Who is Omega For';
whoTitle.fontSize = 24;
whoTitle.fontName = { family: 'Inter', style: 'Semi Bold' };
whoTitle.set({ fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }] });
whoPanel.appendChild(whoTitle);

const whoBody = figma.createText();
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
whoBody.characters = 'Funds, treasuries, payment companies, and traders who need private price discovery.';
whoBody.fontSize = 14;
whoBody.fontName = { family: 'Inter', style: 'Regular' };
whoBody.set({ fills: [{ type: 'SOLID', color: { r: 0.63, g: 0.63, b: 0.67 } }] });
whoPanel.appendChild(whoBody);
whoWhySection.appendChild(whoPanel);

const whyPanel = figma.createAutoLayout('VERTICAL', {
  name: 'Why Omega',
  itemSpacing: 20
});
whyPanel.resize(frameWidth / 2 - 20, 300);
whyPanel.set({ fills: [{ type: 'SOLID', color: { r: 0.15, g: 0.15, b: 0.16 }, opacity: 0.5 }], cornerRadius: 12, paddingLeft: 32, paddingRight: 32, paddingTop: 32, paddingBottom: 32 });

const whyTitle = figma.createText();
await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
whyTitle.characters = 'Why Omega';
whyTitle.fontSize = 24;
whyTitle.fontName = { family: 'Inter', style: 'Semi Bold' };
whyTitle.set({ fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }] });
whyPanel.appendChild(whyTitle);

const whyBody = figma.createText();
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
whyBody.characters = 'Private orderbook. Shielded liquidity access. Verifiable execution.';
whyBody.fontSize = 14;
whyBody.fontName = { family: 'Inter', style: 'Regular' };
whyBody.set({ fills: [{ type: 'SOLID', color: { r: 0.63, g: 0.63, b: 0.67 } }] });
whyPanel.appendChild(whyBody);
whoWhySection.appendChild(whyPanel);
mainFrame.appendChild(whoWhySection);

// Mechanism Animation
const mechanismSection = figma.createAutoLayout('VERTICAL', {
  name: 'Mechanism (Void Animation)',
  itemSpacing: 40
});
mechanismSection.set({
  paddingLeft: 60,
  paddingRight: 60,
  paddingTop: 100,
  paddingBottom: 100
});

const mechTitle = figma.createText();
await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
mechTitle.characters = 'How Orders Flow Through Omega';
mechTitle.fontSize = 48;
mechTitle.fontName = { family: 'Inter', style: 'Semi Bold' };
mechTitle.set({ fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }] });
mechanismSection.appendChild(mechTitle);

const mechDesc = figma.createText();
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
mechDesc.characters = 'Intent Enters → Private Matching → Liquidity Access → Verifiable Execution\n(Orders visualized being pulled into void at center)';
mechDesc.fontSize = 14;
mechDesc.fontName = { family: 'Inter', style: 'Regular' };
mechDesc.set({ fills: [{ type: 'SOLID', color: { r: 0.63, g: 0.63, b: 0.67 } }] });
mechanismSection.appendChild(mechDesc);
mainFrame.appendChild(mechanismSection);

// Carousel Signup
const carouselSection = figma.createAutoLayout('VERTICAL', {
  name: 'Carousel Signup',
  itemSpacing: 40
});
carouselSection.set({
  paddingLeft: 60,
  paddingRight: 60,
  paddingTop: 100,
  paddingBottom: 100
});

const carouselTitle = figma.createText();
await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
carouselTitle.characters = 'Get Started';
carouselTitle.fontSize = 40;
carouselTitle.fontName = { family: 'Inter', style: 'Semi Bold' };
carouselTitle.set({ fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }] });
carouselSection.appendChild(carouselTitle);

const carouselDesc = figma.createText();
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
carouselDesc.characters = 'Fund Account  •  Design Partner  •  Developer Access';
carouselDesc.fontSize = 14;
carouselDesc.fontName = { family: 'Inter', style: 'Regular' };
carouselDesc.set({ fills: [{ type: 'SOLID', color: { r: 0.63, g: 0.63, b: 0.67 } }] });
carouselSection.appendChild(carouselDesc);
mainFrame.appendChild(carouselSection);

// Footer
const footer = figma.createAutoLayout('HORIZONTAL', {
  name: 'Footer',
  itemSpacing: 0
});
footer.set({
  fills: [{ type: 'SOLID', color: { r: 0.04, g: 0.04, b: 0.05 } }],
  paddingLeft: 60,
  paddingRight: 60,
  paddingTop: 40,
  paddingBottom: 40
});

const footerText = figma.createText();
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
footerText.characters = '© 2025 Omega Markets  •  Private FX Execution';
footerText.fontSize = 12;
footerText.fontName = { family: 'Inter', style: 'Regular' };
footerText.set({ fills: [{ type: 'SOLID', color: { r: 0.63, g: 0.63, b: 0.67 } }] });
footer.appendChild(footerText);
mainFrame.appendChild(footer);

page.appendChild(mainFrame);

figma.currentPage.selection = [mainFrame];
figma.viewport.scrollAndZoomIntoView([mainFrame]);
