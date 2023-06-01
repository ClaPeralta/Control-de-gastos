// variables y selectores
const formulario = document.querySelector("#agregar-gasto");
const gastoListado = document.querySelector("#gastos ul");

//Eventos

eventListeneres();
function eventListeneres() {
  document.addEventListener("DOMContentLoaded", preguntarPresupuesto);

  formulario.addEventListener("submit", agregarGasto);
}

//Clases
class Presupuesto {
  constructor(presupuesto) {
    this.presupuesto = Number(presupuesto);
    this.restante = Number(presupuesto);
    this.gastos = [];
  }

  nuevoGasto(gasto) {
    //lo pongo en Presupuesto porque es la info con la q voy a ir completando el array de this.gastos que arranca vacio
    this.gastos = [...this.gastos, gasto];
    this.calcularRestante();
  }
  calcularRestante() {
    const gastado = this.gastos.reduce(
      (total, gasto) => total + gasto.cantidad,
      0
    );

    this.restante = this.presupuesto - gastado;
  }

  eliminarGasto(id) {
    this.gastos = this.gastos.filter((gasto) => gasto.id !== id);
    this.calcularRestante();
  }
}

class UI {
  insertarPresupuesto(cantidad) {
    //extraigo del objeto cantidad los valores
    const { presupuesto, restante } = cantidad;

    //agrego al HTML
    document.querySelector("#total").textContent = presupuesto;
    document.querySelector("#restante").textContent = restante;
  }

  imprimirAlerta(mensaje, tipo) {
    //creo div para el mensaje o alerta
    const divMensaje = document.createElement("div");
    divMensaje.classList.add("text-center", "alert");

    if (tipo === "error") {
      divMensaje.classList.add("alert-danger");
    } else {
      divMensaje.classList.add("alert-success");
    }

    //agregar mensaje de error
    divMensaje.innerHTML = mensaje;

    //insert el mensaje en el HTML
    document.querySelector(".primario").insertBefore(divMensaje, formulario);

    //quitar el mensaje del HTML despues de un tiempo
    setTimeout(() => {
      divMensaje.remove();
    }, 3000);
  }

  mostrarGastos(gastos) {
    this.limpiarHTML();
    //iterar sobre los gastos
    gastos.forEach((gasto) => {
      const { cantidad, nombre, id } = gasto;

      //crear un LI
      const nuevoGasto = document.createElement("li");
      nuevoGasto.className =
        "list-group-item d-flex justify-content-between align-items-center";
      //nuevoGasto.setAttribute('data-id', id); <--antigua forma en la q se usaba
      nuevoGasto.dataset.id = id;

      //console.log(nuevoGasto);
      //Agregar el HTML del gasto
      nuevoGasto.innerHTML = `${nombre} <span class='badge badge-primary badge-pill'> $ ${cantidad} </span>`;

      //Boton para borrar el gasto
      const btnBorrar = document.createElement("button");
      btnBorrar.classList.add("btn", "btn-danger", "btn-gasto");
      btnBorrar.textContent = "Borrar";
      btnBorrar.onclick = () => {
        eliminarGasto(id);
      };

      nuevoGasto.appendChild(btnBorrar);

      //Agregar al HTML
      gastoListado.appendChild(nuevoGasto);
    });
  }

  //limpiar HTML para que no se dupliquen los gastos creados y listados anteriormente
  limpiarHTML() {
    while (gastoListado.firstChild) {
      gastoListado.removeChild(gastoListado.firstChild);
    }
  }

  actualizarRestante(restante) {
    document.querySelector("#restante").textContent = restante;
  }

  //metodo para comprobar el presupuesto inicial vs lo gastado
  comprobarPresupuesto(presupuestoObj) {
    const { presupuesto, restante } = presupuestoObj;

    const restanteDiv = document.querySelector(".restante");

    //comprobar 25%
    if (presupuesto / 4 > restante) {
      //console.log("gastaste el 75% de tu presupuesto");
      restanteDiv.classList.remove("alert-success", "alert-warning");
      restanteDiv.classList.add("alert-danger");
    } else if (presupuesto / 2 > restante) {
      restanteDiv.classList.remove("alert-success");
      restanteDiv.classList.add("alert-warning");
    } else {
      restanteDiv.classList.remove("alert-danger", "alert-warning");
      restanteDiv.classList.add("alert-success");
    }

    // si se nos acaba el presupuesto o los gastos exceden del presupuesto
    if (restante <= 0) {
      ui.imprimirAlerta("El presupuesto se ha agotado", "error");
      formulario.querySelector('button[type="submit"]').disabled = true;
    }
  }
}

//instancio
const ui = new UI();
let presupuesto; // abro una variable (va a ser un objeto) que se pueda invocar desde cualquier lado y que va a tomar valor dentro de la fn preguntarPresupuesto

//Funciones

function preguntarPresupuesto() {
  const presupuestoUsuario = prompt("Cual es tu presupuesto semanal?");

  //console.log(Number(presupuestoUsuario));

  //valido lo que se ingresa como presupuesto
  if (
    presupuestoUsuario === "" ||
    presupuestoUsuario === null ||
    isNaN(presupuestoUsuario) ||
    presupuestoUsuario <= 0
  ) {
    window.location.reload(); //es para recargar el prompt si es q no ingresan nada o apretan cancelar o escriben un string o pone un numero negativo
  }

  // Pasadas las validaciones de mas arriba puedo decir q ya tengo un presupuesto valido
  presupuesto = new Presupuesto(presupuestoUsuario);
  //console.log(presupuesto);

  ui.insertarPresupuesto(presupuesto);
}

// funcion para agregar los gastos del formulario
function agregarGasto(e) {
  // como es un submit se le agrega la e del evento de dar submit
  e.preventDefault();

  //leer datos del formulario
  const nombre = document.querySelector("#gasto").value;
  const cantidad = Number(document.querySelector("#cantidad").value); //lo convierto en numero si no me lo devuelve como string

  //validar
  if (nombre === "" || cantidad === "") {
    //significa q alguno de los campos esta vacio
    ui.imprimirAlerta("Ambos campos son obligatorios", "error"); //para hacerla reutilizable le paso 2 valores
    console.log("Ambos campos son obligatorios");
    return;
  } else if (cantidad <= 0 || isNaN(cantidad)) {
    ui.imprimirAlerta("Cantidad no valida", "error");
    return;
  }

  //generar objeto con el gasto
  const gasto = { nombre, cantidad, id: Date.now() };

  //agrego un nuevo gasto al objeto presupuesto
  presupuesto.nuevoGasto(gasto);

  ui.imprimirAlerta("Gasto agregado correctamente");

  //imprime todos los gastos arriba del presupuesto utilizando metodos (funciones de UI)
  const { gastos, restante } = presupuesto;
  ui.mostrarGastos(gastos);

  ui.actualizarRestante(restante);

  ui.comprobarPresupuesto(presupuesto);
  //reinicio el formulario borrando todo lo q fue escrito en el submit anterior
  formulario.reset();
}

function eliminarGasto(id) {
  //elimina gastos del oj
  presupuesto.eliminarGasto(id);
  //elimina gastos del HTML
  const { gastos, restante } = presupuesto;
  ui.mostrarGastos(gastos);

  ui.actualizarRestante(restante);

  ui.comprobarPresupuesto(presupuesto);
}
