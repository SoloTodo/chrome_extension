import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import './popup.scss';

class Popup extends Component {
  render() {
    return <div className="container-fluid">
      <div className="row">
        <h1>Popup from React 2!</h1>
      </div>
    </div>
  }
}

ReactDOM.render(<Popup />, document.getElementById('root'));