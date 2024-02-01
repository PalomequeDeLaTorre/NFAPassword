var ruta = require("express").Router();
var subirArchivo = require("../middlewares/subirArchivo");
var { mostrarUsuarios, nuevoUsuario, modificarUsuario, buscarPorID, borrarUsuario } = require("../bd/usuariosBD");
const fs = require('fs').promises;

ruta.get('/', async (req, res) => {
  var usuarios = await mostrarUsuarios();
  res.render("usuarios/mostrar", { usuarios });
});

ruta.get("/nuevousuario", async (req, res) => {
  res.render("usuarios/nuevo");
});

ruta.post("/nuevousuario", subirArchivo(), async (req, res) => {
  req.body.foto = req.file.originalname;
  var error = await nuevoUsuario(req.body);
  res.redirect("/");
});

ruta.get("/editar/:id", async (req, res) => {
  var user = await buscarPorID(req.params.id);
  res.render("usuarios/modificar", { user });
});

ruta.post("/editar", subirArchivo(), async (req, res) => {
  if (req.file != undefined) {
    req.body.foto = req.file.originalname;
  } else {
    req.body.foto = req.body.fotoVieja;
  }
  var error = await modificarUsuario(req.body);
  res.redirect("/");
});

ruta.get("/borrar/:id", async (req, res) => {
  try {
    const user = await buscarPorID(req.params.id);
    if (!user) {
      return res.status(404).send("Usuario no encontrado");
    }
    await fs.unlink(`./web/images/${user.foto}`);
    await borrarUsuario(req.params.id);

    res.redirect("/");
  } catch (error) {
    console.error('Error al borrar la foto o usuario:', error);
    res.status(500).send("Error al borrar la foto o usuario");
  }
});

module.exports = ruta;
