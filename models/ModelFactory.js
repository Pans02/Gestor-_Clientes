// models/ModelFactory.js

import Cliente from './Cliente.js';
import Caso from './Caso.js';
import Usuario from './Usuario.js';

class ModelFactory {
  static crear(tipo, datos) {
    switch (tipo) {
      case 'cliente':
        return new Cliente(datos);
      case 'caso':
        return new Caso(datos);
      case 'usuario':
        return new Usuario(datos);
      default:
        throw new Error(`No existe el tipo de modelo: ${tipo}`);
    }
  }
}

export default ModelFactory;
