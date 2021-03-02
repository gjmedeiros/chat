const express = require("express");
const path = require("path");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "public"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

server.listen(3000);
console.log("Aplicação está em execução...");
console.log("");

app.use("/", (req, res) => {
  res.render("index.html", (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("Pagina ou arquivo nao encontrados");
    }

    res.writeHead(200);
    res.end(data);
  });
});

let messages = [];
let usuarios = [];

io.on("connection", (socket) => {
  console.log(`Socket conectado: ${socket.id}`);

  socket.on("disconnect", () => {
    delete usuarios[socket.usuario];
    console.log(`Socket desconectado: ${socket.id}`);

    io.sockets.emit("UpdateUser", Object.keys(usuarios));
  });

  /* Metodo que valida se o nome do usuario já se encontra no chat
     e atualiza a tabela de usuarios online */
  socket.on("entrar", (usuario, callback) => {
    if (!(usuario in usuarios)) {
      socket.usuario = usuario;
      usuarios[usuario] = socket;

      io.sockets.emit("UpdateUser", Object.keys(usuarios));

      callback(true);
    } else {
      callback(false);
    }
  });

  // Metodo de visualizar mensagens anteriores
  socket.emit("previousMessage", messages);

  // Metodo de Envio de mensagens
  socket.on("sendMessage", (data) => {
    socket.broadcast.emit("receivedMessage", data);
  });
});
