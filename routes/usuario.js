const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport = require("passport")

router.get("/registro", (req, res) => {
    res.render("usuarios/registro")
})
router.post("/registro", (req, res) => {
    var erros = []
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "Email inválido"})
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Senha inválido"})
    }
    if(req.body.senha.length < 4){
        erros.push({texto: "A senha é muito curta"})
    }
    if(req.body.senha != req.body.senha2){
        erros.push({texto: "As senhas são diferentes"})
    }
    if(erros.length > 0){
        res.render("usuarios/registro", {erros: erros})
    }
    else {
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario){
                res.render("usuarios/existente")
            }
            else{
                const novoUsuario = new Usuario ({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                    
                })

                bcrypt.genSalt(10, (erro, salt) =>{
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            res.send("Houve um erro no salvamento do usúario ")
                        }
                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            res.render("usuarios/salva")
                        }).catch((err) => {
                            res.send("Ocorreu um erro ao salvar "+err)
                        })
                    })
                })
            }
        }).catch((err) => {
            res.send("houve um erro "+err)
        })
    }
})
router.get("/login", (req, res) => {
    res.render("usuarios/login")
})

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        fallureRedirect: "/usuarios/login",
        fallureflash: true
    })(req, res, next)
})
router.get("/logout", (req, res) => {

    req.logOut()
    res.render("usuarios/deslogado")

})

module.exports = router