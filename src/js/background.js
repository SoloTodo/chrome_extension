import {apiSettings} from "../react-utils/settings";
import {regexes} from "./matching_urls";

let entity = null;
let availableEntities = [];
let apiResourceObjects = {};

const resourcesUrl = `${apiSettings.endpoint}resources/?names=countries&names=currencies&names=store_types&names=stores&names=number_formats&names=categories`;
fetch(resourcesUrl).then(res => res.json()).then(json => {
  for (const apiResourceObject of json) {
    apiResourceObjects[apiResourceObject.url] = apiResourceObject
  }
});

const nullifyEntity = () => {
  entity = null;
  availableEntities = [];
};

const setBestPriceBadge = () => {
  chrome.browserAction.setBadgeText({
    text: '✓'
  });
  chrome.browserAction.setBadgeBackgroundColor({
    color: '#28a745'
  })
};

const setBadPriceBadge = () => {
  chrome.browserAction.setBadgeText({
    text: '✗'
  });
  chrome.browserAction.setBadgeBackgroundColor({
    color: '#dc3545'
  })
};

const handleUrlChange = url => {
  chrome.browserAction.setBadgeText({
    text: ''
  });

  const urlMatches = regexes.some(regex => regex.test(url));

  if (!urlMatches) {
    nullifyEntity();
    return
  }

  const endpoint = `${apiSettings.apiResourceEndpoints.entities}by_url/?url=${encodeURIComponent(url)}`;

  fetch(endpoint).then(res => res.json()).then(json => {
    if (!json.url) {
      nullifyEntity();
      return
    }

    entity = json;

    if (entity.product) {
      const availableEntitiesEndpoint = `${apiSettings.apiResourceEndpoints.products}available_entities/?countries=1&ids=${entity.product.id}`;
      fetch(availableEntitiesEndpoint).then(res => res.json()).then(json => {
        availableEntities = json['results'][0]['entities'].filter(entity => entity.active_registry.cell_monthly_payment === null);
        if (entity.active_registry && entity.active_registry.is_available) {
          if (!availableEntities.length) {
            setBestPriceBadge()
          } else {
            const entityOfferPrice = parseFloat(entity.active_registry.offer_price);
            const bestMarketPrice = parseFloat(availableEntities[0].active_registry.offer_price);

            if (entityOfferPrice <= bestMarketPrice) {
              setBestPriceBadge()
            } else {
              setBadPriceBadge()
            }
          }
        }
      })
    }
  })
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'loading') {
    return
  }

  if (!tab.active) {
    return
  }

  handleUrlChange(tab.url)
});


chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.getSelected(null, function(tab) {
    handleUrlChange(tab.url)
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.action === "getEntity") {
    sendResponse({
      entity: entity,
      availableEntities: availableEntities,
      apiResourceObjects: apiResourceObjects
    });
  }
});
