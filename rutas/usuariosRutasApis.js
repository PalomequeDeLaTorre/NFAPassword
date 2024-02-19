var ruta=require("express").Router();
var subirArchivo=require("../middlewares/subirArchivo")
var {mostrarUsuarios, nuevoUsuario, modificarUsuario, buscarPorID, borrarUsuario}=require("../bd/usuariosBD");
const fs = require('fs').promises;

ruta.get("/api/mostrarUsuarios",async(req,res)=>{
    var usuarios = await mostrarUsuarios();
    if(usuarios.length>0)
    res.status(200).json(usuarios);
    else 
        res.status(400).json("No hay usuarios");
  
});

ruta.post("/api/nuevousuario",subirArchivo(),async(req, res)=>{
    console.log("Servidor /api/nuevousuario");
    console.log(req.body);
    req.body.foto=req.file.originalname;
    var error=await nuevoUsuario(req.body);
    if(error==0){
        res.status(200).json("Usuario registrado");
    }
    else{
        res.status(400).json("Datos incorrectos");
    }

});

ruta.get("/api/buscarUsuarioPorId/:id",async(req, res)=>{
    var user=await buscarPorID(req.params.id);
    console.log(user);
    if(user==""){
        res.status(400).json("No se encontro ese usuario");
    }

    else {
        res.status(200).json(user);
    }

});

ruta.post("/api/editarUsuario", subirArchivo(), async (req, res) => {
  console.log("Entra al servidor a /api/editarUsuario");
  if (req.file!=undefined){
    req.body.foto=req.file.originalname;
}
else{
    req.body.foto="algo"
}

var error=await modificarUsuario(req.body);
if(error==0){
    res.status(200).json("Usuario actualizado");
}
else{
    res.status(400).json("Error al actualizar el usuario");
}
});

ruta.get("/api/borrarUsuario/:id", async (req, res) => {
  var error=await borrarUsuario(req.params.id);
  if(error==0){
      res.status(200).json("Usuario borrado");
  }
  else{
      res.status(400).json("Error al borrar el usuario")
  }
});

    /*try {
      const user = await buscarPorID(req.params.id);
      if (!user) {
        return res.status(404).json("Usuario no encontrado");
      }
      await fs.unlink(`./web/images/${user.foto}`);
      const error = await borrarUsuario(req.params.id);
      if (error === 0) {
        res.status(200).json("Usuario borrado");
      } else {
        res.status(400).json("Error al borrar el usuario");
      }
    } catch (error) {
      console.error('Error al borrar la foto o usuario:', error);
      res.status(500).json("Error al borrar la foto o usuario");
    }
  });*/



module.exports=ruta;