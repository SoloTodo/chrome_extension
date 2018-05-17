import React, {Component} from 'react';

import {ApiResourceObject} from "../../react-utils/ApiResource";
import {formatCurrency} from '../../react-utils/utils'

import logo from '../../img/logo.png';


export default class Popup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      entity: undefined,
      availableEntities: [],
      apiResourceObjects: {},
    }
  }

  componentDidMount() {
    chrome.runtime.sendMessage(
        {
          action: "getEntity"
        },
        response => {
          this.setState({
            entity: response.entity,
            availableEntities: response.availableEntities,
            apiResourceObjects: response.apiResourceObjects
          })
        });
  }

  render() {
    const entity = this.state.entity && new ApiResourceObject(this.state.entity, this.state.apiResourceObjects);
    const availableEntities = this.state.availableEntities.map(entity => new ApiResourceObject(entity, this.state.apiResourceObjects));

    let content = null;

    if (!entity) {
      content = <p>No se encontraron coincidencias</p>
    } else if (!entity.product) {
      content = <p>Este producto aun no ha sido procesado por el staff de SoloTodo</p>
    } else {
      content = <h1><a href={`https://www.solotodo.com/products/${entity.product.id}`} target="_blank">{entity.product.name}</a></h1>
    }

    return <div className="container-fluid">
      <div className="row">
        <div className="col-12 text-center">
          <img src={logo} />
        </div>

        <div className="col-12 mt-2">
          {content}
        </div>

        {availableEntities.length ?
        <div className="col-12">
          <table>
            <thead>
            <tr>
              <th>Tienda</th>
              <th className="text-right">Oferta</th>
              <th className="text-right">Normal</th>
            </tr>
            </thead>
            <tbody>
            {availableEntities.map(entity => <tr key={entity.id}>
              <td>
                <a href={entity.externalUrl} target="_blank">
                  {entity.store.name}
                </a>
              </td>
              <td className="text-right">
                <a href={entity.externalUrl} target="_blank">
                  {formatCurrency(entity.activeRegistry.offer_price, entity.currency, null, '.', ',')}
                </a>
              </td>
              <td className="text-right">
                <a href={entity.externalUrl} target="_blank">
                  {formatCurrency(entity.activeRegistry.normal_price, entity.currency, null, '.', ',')}
                </a>
              </td>
            </tr>)}
            </tbody>
          </table>
        </div> : null
        }

        <div className="col-12 mt-2">
          <p>
            <a href="https://www.solotodo.com/tos" target="_blank" className="tos">Términos de servicio y uso de información</a>
          </p>
        </div>
      </div>
    </div>
  }
}
