var conexion=require("./conexion").conexionUsuarios;
var {encriptarPassword}=require("../middlewares/funcionesPassword");
var Usuario=require("../modelos/Usuario");
const bcrypt = require('bcrypt');

async function verificarCredenciales(usuario, password) { 
    try {
        const querySnapshot = await conexion.where("usuario", "==", usuario).get();
        if (querySnapshot.empty) {
            return null;
        }
        const usuarioEncontrado = querySnapshot.docs[0].data();

        if (usuarioEncontrado.password !== undefined && usuarioEncontrado.salt !== undefined) {
            const contraseñaValida = compararPassword(password, usuarioEncontrado.password, usuarioEncontrado.salt);

            if (contraseñaValida) {
                return usuarioEncontrado;
            } else {
                return null;
            }
        } else {
            return null; 
        }
    } catch (error) {
        console.log("Error al verificar las credenciales: " + error);
        return null;
    }
}

async function compararPassword(contraseñaIngresada, contraseñaAlmacenada) {
    try {
        return await bcrypt.compare(contraseñaIngresada, contraseñaAlmacenada);
    } catch (error) {
        console.log("Error al comparar contraseñas: " + error);
        return false;
    }
}


async function mostrarUsuarios(){
    var users=[];
    try{
        var usuarios=await conexion.get();
        usuarios.forEach(usuario => {
            var user=new Usuario(usuario.id, usuario.data());
            if (user.bandera === 0){
                users.push(user.obtenerDatos);
    
            }
            
        });  

    }

    catch(err){
        console.log("Error al recuperar usuarios de la base de datos"+err);

    }

    return users;
 
}

async function buscarPorID(id){
    var user;
    try {
        var usuario=await conexion.doc(id).get();
        var usuarioObjeto=new Usuario(usuario.id, usuario.data());
        if (usuarioObjeto.bandera === 0){
            user=usuarioObjeto.obtenerDatos;
        }

    }

    catch(err){
        console.log("Error al recuperar al usuario" + err);
        
    }

    return user;

}

async function nuevoUsuario(datos){
    var {hash, salt}=encriptarPassword(datos.password); 
    datos.password=hash; 
    datos.salt=salt; 
    var user=new Usuario(null,datos);
    var error=1;
    if (user.bandera === 0){
    try{
        await conexion.doc().set(user.obtenerDatos);
        console.log("Usuario insertado a la BD");
        error=0;
    }

    catch(err){
        console.log("Error al capturar al nuevo usuario"+err);

    }

  }
  return error;

}

async function modificarUsuario(datos){
    var error=1;
    var respuestaBuscar=await buscarPorID(datos.id);
    console.log(respuestaBuscar);
    if(respuestaBuscar!=undefined){
        if(datos.foto=="algo"){
            datos.foto=respuestaBuscar.foto;
        }
        console.log("------ password ------------");
        console.log(datos.password);
        datos.admin=respuestaBuscar.admin;
        if(datos.password==""){
            datos.password=datos.passwordViejo;
            datos.salt=datos.saltViejo;
        }
        else{
            var {salt, hash}=encriptarPassword(datos.password);
            datos.password=hash;
            datos.salt=salt;
        }


        var user=new Usuario(datos.id,datos);


        if (user.bandera==0){
            try{
                await conexion.doc(user.id).set(user.obtenerDatos);
                console.log("Usuario actualizado ");
                error=0;
            }
            catch(err){
                console.log("Error al modificar al usuario "+err);
            }
        }
    }
    return error;
}

async function borrarUsuario(id){
    var error=1;
    var user=await buscarPorID(id);
    if(user!=undefined){
    try{
        await conexion.doc(id).delete();
        console.log("Usuario borrado");
        error=0;
    }

    catch(err){
        console.log("Error al borrar el usuario" + err);

    }

    }

    return error;

}

module.exports={
    mostrarUsuarios,
    buscarPorID,
    nuevoUsuario,
    modificarUsuario,
    borrarUsuario,
    verificarCredenciales,
    compararPassword
}