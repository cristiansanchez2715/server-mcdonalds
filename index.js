const express = require("express");
const cors = require("cors");
const port = 4000;
const port2 = 5000;
const app = express();
const socketIO = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const mysql = require("mysql")

// CONFIGURACIOENS GENERALES Y CONECCION WEBSOCKETS PARA LA REALIZACION DE PEDIDOS

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "http://localhost:3000/admin");
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.header("Access-Control-Allow-Headers", "Content-Type");
//   next();
// });
app.use(express.json())
app.options('*', (req, res) => {
  const allowedOrigins = ['https://cristiansanchez2715.github.io/admin', 'https://cristiansanchez2715.github.io'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.send();
});

// Middleware de registro de solicitudes
app.use((req, res, next) => {
  console.log('Solicitud recibida:', req.method, req.url);
  console.log('Cuerpo de la solicitud:', req.body);

  const allowedOrigins = ['https://cristiansanchez2715.github.io/admin', 'https://cristiansanchez2715.github.io'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  next();
});

const corsOptions = {
  // origin: 'https://diningexperiencesource.shop', // Reemplaza con la URL de tu aplicación frontend
  origin:  ['https://cristiansanchez2715.github.io/admin', 'https://cristiansanchez2715.github.io'],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions))

const io = socketIO(server, {
  path: "/socket",
  cors: corsOptions,
});

server.listen(port, () => {
  console.log("servidor macdonalds conectado");
});

app.get("/", (req, res) => {
  res.send("el servidor funciona");
});



io.on("connection", (socket) => {
  console.log("Cliente conectado");

  socket.on('nuevoPedido', (data) => {
    console.log("Nuevo pedido desde el cliente:", data);
    // Aquí puedes procesar el pedido y enviarlo a la cocina, guardar en una base de datos, etc.
    // Por ejemplo, puedes emitir un evento para notificar a la cocina sobre el nuevo pedido.
    io.emit("pedidoALaCocina", data);
    const { products, table, pay } = data;

    // Convertir el objeto products a una cadena JSON
    const productsJSON = JSON.stringify(products);
   
    // Insertar datos en la tabla Pedidos
    const sql = 'INSERT INTO pedidos ( table_number, products, totalPayOrder) VALUES (?, ?, ?)';
    connection.query(sql, [table, productsJSON,  pay], (err, result) => {
      if (err) {
        console.error('Error al insertar datos en la tabla Pedidos:', err);
        // Enviar mensaje de error al cliente a través del socket
        socket.emit('error', 'Error al insertar datos en la tabla Pedidos');
        return;
      }
      console.log('Datos insertados en la tabla Pedidos');
      // Enviar mensaje de éxito al cliente a través del socket
      socket.emit('success', 'Datos insertados correctamente en la tabla Pedidos');
    });
  });
});


// io.on("connection", (socket) => {
//   console.log("Cliente conectado");

//   socket.on('nuevoPedido', (data) => {
//     console.log("Nuevo pedido desde el cliente:", data);
//     // Aquí puedes procesar el pedido y enviarlo a la cocina, guardar en una base de datos, etc.
//     // Por ejemplo, puedes emitir un evento para notificar a la cocina sobre el nuevo pedido.
//     io.emit("pedidoALaCocina", data);
//     const { products, table, pay } = data;

//     // Convertir el objeto products a una cadena JSON
//     const productsJSON = JSON.stringify(products);
   
//     // Insertar datos en la tabla Pedidos
//     const sql = 'INSERT INTO pedidos ( table_number, products, totalPayOrder) VALUES (?, ?, ?)';
//     connection.query(sql, [table, productsJSON,  pay], (err, result) => {
//       if (err) {
//         console.error('Error al insertar datos en la tabla Pedidos:', err);
//         res.status(500).json({ error: 'Error interno del servidor' });
//         return;
//       }
//       console.log('Datos insertados en la tabla Pedidos');
//       res.status(200).json({ message: 'Datos insertados correctamente en la tabla Pedidos' });
//     });
//   });
// });




// CONFIGURACIONES A LA BASE DE DATOS



const connection = mysql.createConnection({
'host': "be1zdultmwmtzebubor1-mysql.services.clever-cloud.com",
'user': 'uve5eoacxovowuli',
'password': 'dgsnebFKs2Q31gjhsfJd',
'database': 'be1zdultmwmtzebubor1',
'port': 3306
})

connection.connect((err) => {
  if (err) {
    console.error("Error de conexión a la base de datos:", err);
  } else {
    console.log("Conexión a la base de datos establecida");
  }
});





// enviar pedidos al admin


app.get('/dataBaseGet', (req, res) => {
 
  // Enviador datos al frontend
  const sql = 'SELECT id, table_number, products, totalPayOrder FROM pedidos';
  connection.query(sql, (err, result) => {
    if (err) {
      console.error('Error al enviar datos al administrador', err);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }
    console.log('Datos enviados al administrador');
    res.status(200).json(result);
  });
});

// Configurar el servidor para escuchar en el puerto 4000



















// app.listen(port2, () => {
//   console.log("server 2 conected")
// })

// app.post('/dataBaseSend', (req, res) => {
//   console.log("esto esta llegando al backend" + JSON.stringify(req.body.data))
//   const { products, table, pay } = req.body.data;

//   // Convertir el objeto products a una cadena JSON
//   const productsJSON = JSON.stringify(products);
 
//   // Insertar datos en la tabla Pedidos
//   const sql = 'INSERT INTO pedidos (products, table_number, pay) VALUES (?, ?, ?)';
//   connection.query(sql, [productsJSON, table, pay], (err, result) => {
//     if (err) {
//       console.error('Error al insertar datos en la tabla Pedidos:', err);
//       res.status(500).json({ error: 'Error interno del servidor' });
//       return;
//     }
//     console.log('Datos insertados en la tabla Pedidos');
//     res.status(200).json({ message: 'Datos insertados correctamente en la tabla Pedidos' });
//   });
// });

