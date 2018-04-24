import React, {Component} from 'react';

export default class Background extends Component {
  componentDidMount() {
    chrome.tabs.onUpdated.addListener(
        function(tabId, changeInfo, tab) {
          if (changeInfo.status === 'loading') {
            console.log(tab.url);
          }
        }
    );
  }

  render() {
    return <h1>Hi from React!</h1>
  }
}