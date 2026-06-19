
var seccionLogin = document.getElementById("seccion-login");
var inventarioPrincipal = document.getElementById("inventario-principal");
var formularioLogin = document.getElementById("formulario-login");
var entradaUsuario = document.getElementById("usuario");
var entradaClave = document.getElementById("clave");
var mensajeError = document.getElementById("error-login");

var entradaNombre = document.getElementById("nombre");
var entradaTipo = document.getElementById("tipo");
var entradaPrecio = document.getElementById("precio");
var entradaGanancia = document.getElementById("ganancia");
var entradaStock = document.getElementById("stock");
var tablaProductos = document.getElementById("tablaProductos");
var tablaVentas = document.getElementById("tablaVentas");
var formularioInventario = document.getElementById("formulario-inventario");
var textoTotalGanancias = document.getElementById("total-ganancias");


var selectProducto = document.getElementById("select-producto");
var formularioFacturacion = document.getElementById("formulario-facturacion");
var clienteNombre = document.getElementById("cliente-nombre");
var facturaCantidad = document.getElementById("factura-cantidad");


var inventario = [];
var historialVentas = [];
var gananciasTotales = 0;


window.cambiarPestana = function(pestanaDestino) {
    document.getElementById("vista-registro").style.display = "none";
    document.getElementById("vista-inventario").style.display = "none";
    document.getElementById("vista-reportes").style.display = "none";
    document.getElementById("vista-factura").style.display = "none";
    
    document.getElementById("pestana-registro").classList.remove("activa");
    document.getElementById("pestana-inventario").classList.remove("activa");
    document.getElementById("pestana-reportes").classList.remove("activa");
    document.getElementById("pestana-factura").classList.remove("activa");

    if (pestanaDestino === "registro") {
        document.getElementById("vista-registro").style.display = "block";
        document.getElementById("pestana-registro").classList.add("activa");
    } else if (pestanaDestino === "inventario") {
        document.getElementById("vista-inventario").style.display = "block";
        document.getElementById("pestana-inventario").classList.add("activa");
    } else if (pestanaDestino === "reportes") {
        document.getElementById("vista-reportes").style.display = "block";
        document.getElementById("pestana-reportes").classList.add("activa");
    } else if (pestanaDestino === "factura") {
        document.getElementById("vista-factura").style.display = "block";
        document.getElementById("pestana-factura").classList.add("activa");
        actualizarSelectProductos();
    }
};


function actualizarSelectProductos() {
    var opciones = '<option value="">-- Seleccione un articulo --</option>';
    for (let i = 0; i < inventario.length; i = i + 1) {
        if (inventario[i].stock > 0) {
            opciones = opciones + '<option value="' + i + '">' + inventario[i].nombre + ' (Dispo: ' + inventario[i].stock + ')</option>';
        }
    }
    selectProducto.innerHTML = opciones;
}


function actualizarTablasUI() {
    textoTotalGanancias.innerHTML = "$" + gananciasTotales;

    var contenidoProductos = "";
    for (let i = 0; i < inventario.length; i = i + 1) {
        var producto = inventario[i];
        
        var celdaStock = producto.stock + " uds";
        var botonVender = '<button class="btn-vender" onclick="ejecutarTransaccionVenta(' + i + ')">Vender 1</button>';
        
        if (producto.stock === 0) {
            celdaStock = '<span class="alerta-roja">AGOTADO</span>';
            botonVender = '<button class="btn-vender" disabled style="opacity:0.3; cursor:not-allowed;">Vender 1</button>';
        } else if (producto.stock < 3) {
            celdaStock = '<span class="alerta-roja">' + producto.stock + ' uds (Bajo Stock)</span>';
        }

        contenidoProductos = contenidoProductos + 
            '<tr>' +
                '<td><strong>' + producto.nombre + '</strong></td>' +
                '<td>' + producto.tipo + '</td>' +
                '<td>$' + producto.costoBase + '</td>' +
                '<td>$' + producto.ivaCalculado + '</td>' +
                '<td><strong>$' + producto.precioVentaPublico + '</strong></td>' +
                '<td>' + celdaStock + '</td>' +
                '<td>' +
                    botonVender +
                    '<button class="btn-eliminar" onclick="eliminarFilaItem(' + i + ')">X</button>' +
                '</td>' +
            '</tr>';
    }
    tablaProductos.innerHTML = contenidoProductos;

    var contenidoVentas = "";
    if (historialVentas.length === 0) {
        contenidoVentas = '<tr><td colspan="3" style="text-align:center; color:grey;">No hay ventas registradas.</td></tr>';
    } else {
        for (let j = historialVentas.length - 1; j >= 0; j = j - 1) {
            var venta = historialVentas[j];
            contenidoVentas = contenidoVentas + 
                '<tr>' +
                    '<td>' + venta.hora + '</td>' +
                    '<td>' + venta.articulo + '</td>' +
                    '<td><strong>$' + venta.monto + '</strong></td>' +
                '</tr>';
        }
    }
    tablaVentas.innerHTML = contenidoVentas;
}


if (formularioInventario) {
    formularioInventario.addEventListener("submit", function(e) {
        e.preventDefault(); 

        var nombreLinter = entradaNombre.value.trim().toLowerCase();
        nombreLinter = nombreLinter.replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u");
        
        var unidadesNuevas = parseInt(entradaStock.value);
        var encontradoIndex = -1;

        for (let i = 0; i < inventario.length; i = i + 1) {
            var guardadoLinter = inventario[i].nombre.toLowerCase();
            guardadoLinter = guardadoLinter.replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u");

            if (guardadoLinter === nombreLinter) {
                encontradoIndex = i;
            }
        }

        if (encontradoIndex !== -1) {
            inventario[encontradoIndex].stock = inventario[encontradoIndex].stock + unidadesNuevas;
            alert("Abastecimiento Exitoso. Se anadieron " + unidadesNuevas + " unidades a " + inventario[encontradoIndex].nombre);
        } else {
            var costoBaseNumerico = parseFloat(entradaPrecio.value);
            var porcentajeGanancia = parseFloat(entradaGanancia.value);
            
            var iva = costoBaseNumerico * 0.19;               
            var costoConIva = costoBaseNumerico + iva;         
            var gananciaCalculada = costoConIva * (porcentajeGanancia / 100);
            var precioPublico = costoConIva + gananciaCalculada;            

            var nuevoProducto = {
                nombre: entradaNombre.value, 
                tipo: entradaTipo.value,
                costoBase: Math.round(costoBaseNumerico),
                ivaCalculado: Math.round(iva),
                precioVentaPublico: Math.round(precioPublico), 
                stock: unidadesNuevas
            };
            inventario.push(nuevoProducto);
        }

        actualizarTablasUI();
        
        entradaNombre.value = "";
        entradaTipo.value = "";
        entradaPrecio.value = "";
        entradaGanancia.value = "";
        entradaStock.value = "";
    });
}


if (formularioFacturacion) {
    formularioFacturacion.addEventListener("submit", function(e) {
        e.preventDefault();

        var indexSeleccionado = selectProducto.value;
        var cantidadAComprar = parseInt(facturaCantidad.value);

        if (indexSeleccionado === "") {
            alert("Por favor seleccione un producto.");
            return;
        }

        var productoSeleccionado = inventario[indexSeleccionado];

        if (cantidadAComprar > productoSeleccionado.stock) {
            alert("Error. Solo quedan " + productoSeleccionado.stock + " unidades disponibles.");
            return;
        }

        
        productoSeleccionado.stock = productoSeleccionado.stock - cantidadAComprar;

        var totalVentaFactura = productoSeleccionado.precioVentaPublico * cantidadAComprar;
        var subtotalSinIva = Math.round(totalVentaFactura / 1.19);
        var ivaTotalFactura = totalVentaFactura - subtotalSinIva;

        gananciasTotales = gananciasTotales + totalVentaFactura;

        var tiempoActual = new Date();
        var horaFormateada = tiempoActual.toLocaleTimeString();
        var fechaFormateada = tiempoActual.toLocaleDateString();

        document.getElementById("factura-fecha").innerHTML = fechaFormateada + " " + horaFormateada;
        document.getElementById("factura-cliente-texto").innerHTML = clienteNombre.value.toUpperCase();
        document.getElementById("factura-detalle-prod").innerHTML = cantidadAComprar + "x " + productoSeleccionado.nombre + " - c/u $" + productoSeleccionado.precioVentaPublico;
        document.getElementById("factura-subtotal").innerHTML = "$" + subtotalSinIva;
        document.getElementById("factura-iva").innerHTML = "$" + ivaTotalFactura;
        document.getElementById("factura-total").innerHTML = "$" + totalVentaFactura;

        var registroNuevaVenta = {
            hora: horaFormateada,
            articulo: cantidadAComprar + "x " + productoSeleccionado.nombre + " (Factura)",
            monto: totalVentaFactura
        };
        historialVentas.push(registroNuevaVenta);

        actualizarTablasUI();
        actualizarSelectProductos();
        clienteNombre.value = "";
        facturaCantidad.value = "";
    });
}


window.ejecutarTransaccionVenta = function(posicion) {
    if (inventario[posicion].stock > 0) {
        inventario[posicion].stock = inventario[posicion].stock - 1;
        
        var valorDeVenta = inventario[posicion].precioVentaPublico;
        gananciasTotales = gananciasTotales + valorDeVenta;

        var tiempoActual = new Date();
        var horaFormateada = tiempoActual.toLocaleTimeString();
        
        var registroNuevaVenta = {
            hora: horaFormateada,
            articulo: inventario[posicion].nombre,
            monto: valorDeVenta
        };
        historialVentas.push(registroNuevaVenta);

        actualizarTablasUI();
    }
};


window.eliminarFilaItem = function(posicion) {
    if (confirm("¿Remover este producto del inventario?")) {
        inventario.splice(posicion, 1);
        actualizarTablasUI();
    }
};


if (formularioLogin) {
    formularioLogin.addEventListener("submit", function(e) {
        e.preventDefault();
        if (entradaUsuario.value === "admin" && entradaClave.value === "1234") {
            seccionLogin.style.display = "none";
            inventarioPrincipal.style.display = "block";
            mensajeError.style.display = "none";
            cambiarPestana('registro');
        } else {
            mensajeError.style.display = "block";
        }
    });
}

var botonSalir = document.getElementById("btn-salir");
if (botonSalir) {
    botonSalir.addEventListener("click", function() {
        seccionLogin.style.display = "block";
        inventarioPrincipal.style.display = "none";
        entradaUsuario.value = "";
        entradaClave.value = "";
    });
}

actualizarTablasUI();
