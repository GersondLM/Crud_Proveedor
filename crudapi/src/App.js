import React, { Component } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const url = "https://ferreteria-api.onrender.com/api/v3/cliente/findall"; // URL de la API

class App extends Component {
  state = {
    data: [],
    modalInsertar: false,
    modalEliminar: false,
    form: {
      id: '',
      nombre: '',
      email: '',
      status: '',
    },
    tipoModal: 'insertar',
  };

  componentDidMount() {
    this.fetchClientes();
  }

  fetchClientes = () => {
    axios.get(url)
      .then(response => {
        // Asegúrate de que estás manejando la respuesta correctamente
        if (Array.isArray(response.data.clientes)) {
          this.setState({ data: response.data.clientes });
        } else {
          console.error('La respuesta no contiene un array de clientes:', response.data);
          this.setState({ data: [] });
        }
      })
      .catch(error => {
        console.error('Error al obtener los datos:', error);
        this.setState({ data: [] });
      });
  };

  peticionPost = async () => {
    delete this.state.form.id; // No enviar ID al crear un nuevo cliente
    await axios.post(url, this.state.form)
      .then(response => {
        this.modalInsertar();
        this.fetchClientes(); // Refrescar la lista de clientes
      })
      .catch(error => {
        console.error('Error al insertar cliente:', error);
      });
  };

  peticionPut = () => {
    axios.put(url + this.state.form.id, this.state.form)
      .then(response => {
        this.modalInsertar();
        this.fetchClientes(); // Refrescar la lista de clientes
      })
      .catch(error => {
        console.error('Error al actualizar cliente:', error);
      });
  };

  peticionDelete = () => {
    axios.delete(url + this.state.form.id)
      .then(response => {
        this.setState({ modalEliminar: false });
        this.fetchClientes(); // Refrescar la lista de clientes
      })
      .catch(error => {
        console.error('Error al eliminar cliente:', error);
      });
  };

  modalInsertar = () => {
    this.setState({ modalInsertar: !this.state.modalInsertar, form: { id: '', nombre: '', email: '', status: '' } });
  };

  seleccionarCliente = (cliente) => {
    this.setState({
      tipoModal: 'actualizar',
      form: {
        id: cliente.id,
        nombre: cliente.nombre,
        email: cliente.email,
        status: cliente.status,
      },
    });
  };

  handleChange = async (e) => {
    e.persist();
    await this.setState({
      form: {
        ...this.state.form,
        [e.target.name]: e.target.value,
      },
    });
    console.log(this.state.form);
  };

  render() {
    const { form } = this.state;
    return (
      <div className="App">
        <h1>Lista de Clientes</h1>
        <button className="btn btn-success" onClick={() => { this.setState({ form: { id: '', nombre: '', email: '', status: '' }, tipoModal: 'insertar' }); this.modalInsertar(); }}>Agregar Cliente</button>
        <br /><br />
        {this.state.data.length === 0 ? (
          <p>Cargando datos...</p>
        ) : (
          <table className="table table-hover table-bordered shadow-sm">
            <thead className="table-primary">
              <tr>
                <th scope="col">Id</th>
                <th scope="col">Nombre</th>
                <th scope="col">Email</th>
                <th scope="col">Status</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {this.state.data.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.id}</td>
                  <td>{cliente.nombre}</td>
                  <td>{cliente.email}</td>
                  <td>{cliente.status}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => { this.seleccionarCliente(cliente); this.modalInsertar(); }}><FontAwesomeIcon icon={faEdit} /></button>
                    {"  "}
                    <button className="btn btn-danger" onClick={() => { this.seleccionarCliente(cliente); this.setState({ modalEliminar: true }); }}><FontAwesomeIcon icon={faTrashAlt} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Modal para Agregar/Actualizar Cliente */}
        <Modal isOpen={this.state.modalInsertar}>
          <ModalHeader style={{ display: 'block' }}>
            <span style={{ float: 'right' }} onClick={this.modalInsertar}>x</span>
          </ModalHeader>
          <ModalBody>
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                className="form-control"
                type="text"
                name="nombre"
                id="nombre"
                onChange={this.handleChange}
                value={form.nombre || ''}
                required
              />
              <br />
              <label htmlFor="email">Email</label>
              <input
                className="form-control"
                type="email"
                name="email"
                id="email"
                onChange={this.handleChange}
                value={form.email || ''}
                required
              />
              <br />
              <label htmlFor="status">Status</label>
              <input
                className="form-control"
                type="text"
                name="status"
                id="status"
                onChange={this.handleChange}
                value={form.status || ''}
                required
              />
            </div>
          </ModalBody>
          <ModalFooter>
            {this.state.tipoModal === 'insertar' ? (
              <button className="btn btn-success" onClick={this.peticionPost}>
                Insertar
              </button>
            ) : (
              <button className="btn btn-primary" onClick={this.peticionPut}>
                Actualizar
              </button>
            )}
            <button className="btn btn-danger" onClick={this.modalInsertar}>Cancelar</button>
          </ModalFooter>
        </Modal>

        {/* Modal para Confirmar Eliminación */}
        <Modal isOpen={this.state.modalEliminar}>
          <ModalBody>
            ¿Estás seguro que deseas eliminar al cliente {form && form.nombre}?
          </ModalBody>
          <ModalFooter>
            <button className="btn btn-danger" onClick={this.peticionDelete}>Sí</button>
            <button className="btn btn-secondary" onClick={() => this.setState({ modalEliminar: false })}>No</button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default App;
