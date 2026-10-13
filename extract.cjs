const fs = require('fs');
const path = require('path');

const dir = 'd:/SpringBoot Project/RRMS/Frontend Self/src';
const pagesDir = path.join(dir, 'pages');

const result = {
  routes: {},
  pages: [],
  tabs: {},
  forms: {},
  modals: {},
  buttons: {},
  api: []
};

// Simple regex parsers
const extractTabs = (content, filename) => {
  const tabsMatch = [...content.matchAll(/tabs=\{(.*?)\}/g)];
  const tabList = [];
  tabsMatch.forEach(m => {
    tabList.push(m[1].substring(0, 100)); // Just get snippet
  });
  
  const constTabsMatch = [...content.matchAll(/const tabs = \[(.*?)\]/g)];
  constTabsMatch.forEach(m => {
    tabList.push(m[1]);
  });
  
  if (tabList.length > 0) result.tabs[filename] = tabList;
};

const extractForms = (content, filename) => {
  const fieldsMatch = [...content.matchAll(/<Fields[\s\S]*?fields=\{\[(.*?)\]\}/g)];
  const forms = [];
  fieldsMatch.forEach(m => {
    // Extract names
    const names = [...m[1].matchAll(/name:\s*'(.*?)'/g)].map(x => x[1]);
    forms.push(names);
  });
  
  if (forms.length > 0) result.forms[filename] = forms;
};

const extractModals = (content, filename) => {
  const modalsMatch = [...content.matchAll(/<Modal[\s\S]*?title=\{?(.*?)\}?[\s>]/g)];
  const modals = [];
  modalsMatch.forEach(m => {
    modals.push(m[1].trim());
  });
  if (modals.length > 0) result.modals[filename] = modals;
};

const extractButtons = (content, filename) => {
  const btnMatch = [...content.matchAll(/<Button[\s\S]*?>(.*?)<\/Button>/g)];
  const buttons = [];
  btnMatch.forEach(m => {
    // Clean up JSX inside button
    let text = m[1].replace(/<[^>]+>/g, '').trim();
    if (text) buttons.push(text);
  });
  if (buttons.length > 0) {
      result.buttons[filename] = [...new Set(buttons)];
  }
};

const processFile = (filepath) => {
  const filename = path.basename(filepath);
  const content = fs.readFileSync(filepath, 'utf-8');
  result.pages.push(filename);
  extractTabs(content, filename);
  extractForms(content, filename);
  extractModals(content, filename);
  extractButtons(content, filename);
};

fs.readdirSync(pagesDir).forEach(file => {
  if (file.endsWith('.tsx')) {
    processFile(path.join(pagesDir, file));
  }
});

// App.tsx for routes
const appTsx = fs.readFileSync(path.join(dir, 'App.tsx'), 'utf-8');
const routesMatch = [...appTsx.matchAll(/screens: Record<string, React\.ComponentType> = \{(.*?)\};/gs)];
if (routesMatch.length > 0) {
  result.routes.screens = routesMatch[0][1].trim();
}
const accessMatch = [...appTsx.matchAll(/const access: Record<string, string\[\]> = \{(.*?)\};/gs)];
if (accessMatch.length > 0) {
  result.routes.access = accessMatch[0][1].trim();
}

fs.writeFileSync('extraction_result.json', JSON.stringify(result, null, 2));
console.log('Extraction complete');
