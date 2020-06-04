const localStratregy = require("passport-local").Strategy
const mongose = require('mongoose')
const bcrypt = require("bcryptjs")


// Model de usúario

require("..//models/Usuario")
const Usuario = mongose.model("usuarios")

module.exports = function(passport){

    passport.use(new localStratregy({usernameField: 'email', passwordField:"senha"}, (email, senha, done) => {
        Usuario.findOne({email: email}).lean().then((usuario) => {
            if(!usuario){
                return done(null, false, {message: "Esta conta nao existe"})
            }
            bcrypt.compare(senha, usuario.senha, (erro, batem) => {

                if(batem){
                    return done(null, usuario)
                }else{
                    return done(null, false, {message: "Senha incorreta"})
                }

            })
        })
    })) 
    passport.serializeUser(function(usuario, done) {
        done(null, usuario._id);
        // if you use Model.id as your idAttribute maybe you'd want
        // done(null, user.id);
    });
    
    passport.deserializeUser(function(id, done) {
      Usuario.findById(id, function(err, usuario) {
        done(err, usuario);
      });
    });
   /* passport.serializeUser((usuario, done) => {
        done(null, usuario.id)
    })
    passport.deserializeUser((id, done) => {
        usuario.findById(id, (err, user) => {
            done(err, usuario)
        })
    })*/
}