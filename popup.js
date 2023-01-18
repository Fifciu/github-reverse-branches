// const console = chrome.extension.getBackgroundPage().console;
const regex = new RegExp("https://github.com/(.*?)/(.*?)/compare/");
const query = { active: true, currentWindow: true };
const mainBranch = 'main'; // TODO: figuring out

const canSwitchOnTab = tab => {
  //https://github.com/*/*/compare/
  if (!tab.url.startsWith('https://github.com')) {
    return false
  }
  return Boolean(tab.url.match(regex));
};

// canSwitchOnTab({ url: 'https://github.com/vuestorefront/commercetools/compare/develop?expand=1' }) //?


const switchBtn = document.querySelector('#switchBtn');
const btnOnClick = () => {
  chrome.tabs.query(query, ([tab, ]) => {
    const currentUrl = new URL(tab.url);
    const pathnameParts = currentUrl.pathname.split('/')
    const branchesInUrl = pathnameParts.pop();
    if (branchesInUrl.includes('...')) {
      const [to, from] = branchesInUrl.split('...');
      pathnameParts.push(`${from}...${to}`);
    } else {
      pathnameParts.push(`${branchesInUrl}...${mainBranch}`);
    }
    chrome.tabs.update(tab.id, {
      url: `${currentUrl.origin}${pathnameParts.join('/')}${currentUrl.search}${currentUrl.hash}`
    })
  });
};
switchBtn.addEventListener('click', btnOnClick);

window.onload = () => {
  chrome.tabs.query(query, ([tab, ]) => {
    if (!tab) {
      return
    }
    if (!canSwitchOnTab(tab)) {
      switchBtn.disabled = true;
    } else {
      switchBtn.disabled = false;
    }
  })
};

window.onunload = () => {
  switchBtn.removeEventListener('click', btnOnClick);
};