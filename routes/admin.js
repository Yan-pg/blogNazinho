const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/categoria")
const categoria = mongoose.model("categorias")
require('../models/postagens')
const Postagem = mongoose.model("postagens")
const {eAdmin} = require("../helpers/eAdmin")

router.get("/", eAdmin,(req, res) => {
    res.render("admin/index")
})   
router.get("/posts", eAdmin, (req, res) => {
    res.send("Página de posts")
})
router.get("/categorias", eAdmin, (req, res) => {
    categoria.find().sort({data:'desc'}).lean().then((categorias) => {
        res.render('admin/categorias', {categorias: categorias})
    }).catch((err) => { 
       console.log("ocorreu um erro "+err)
    })
})
router.get("/categorias/add", eAdmin, (req, res) => {
    res.render("admin/addcategorias")
})
router.post("/categorias/nova", eAdmin, (req, res) => {
    
    var erros = []
    
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null ){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }
    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria é muito pequeno"})
    }
    if(erros.length > 0){
        res.render("admin/addcategoria", {erros: erros})
    }
    else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new categoria(novaCategoria).save().then(() => {
            res.render('admin/redirect');
        }).catch((err) => {
            res.send("ocorreu um erro "+err)
        })
    }
    
})
router.get("/categorias/edit/:id", eAdmin, (req, res) => {
    categoria.findOne({_id:req.params.id}).lean().then((categoria)=> {
        res.render("admin/editcategorias", {categoria: categoria})
    }).catch((err) => {
        console.log("ocorreu um erro "+err)
    })
})
router.post("/categorias/edit", eAdmin, (req,res) => {
    categoria.findOne({_id: req.body.id}).then((categoria) => {
        categoria.nome = req.body.nome
        categoria.slug = req.body.nome

        categoria.save().then(() => {
            res.render("admin/edit_redirect")
        })

    }).catch((err) =>{
       res.render("admin/error")
       console.log("ocorreu um erro "+err)
    })
})
router.post("/categorias/deletar", eAdmin, (req, res) => {
    categoria.remove({_id: req.body.id}).then(() => {
        res.render("admin/categorias")
    }).catch((err) => {
        res.render("admin/erro_delete")
    })
})
router.get("/postagem", eAdmin, (req, res) => {
    Postagem.find().lean().populate("categoria").sort({data:"desc"}).then((postagens) => {
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err) => {
        res.send("Ocorreu um erro ao lista as postagens "+err)
    })
})
router.get("/postagens/add", eAdmin, (req, res) => {
    categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagens", {categorias: categorias})
    }).catch((err) => {
        res.send("Ouve um erro ao carregar o fomulário")
    })
})
router.post("/postagens/nova", eAdmin, (req, res) => {
    var erros = []

    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria inválida, registre uma categoria"})
    } 
    if(erros.length > 0){
        res.render("admin/addpostagens", {erros: erros})
    }
    else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descrição: req.body.descrição,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }
        new Postagem(novaPostagem).save().then(() => {
            res.render("admin/postagem_success")
        }).catch((err) => {
            res.render("admin/postagem_erro")
        })
    }
})
router.get("/postagens/edit/:id", eAdmin, (req, res) => {

    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
        categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
        }).catch((err) => {
            res.send("Ocorreu um erro ao listar as categorias "+err)
        })
    }).catch((err) => {
        res.send("Ocorreu um erro ao carregar o formulario de edição "+err)
    })
})
router.post("/postagem/edit", eAdmin, (req, res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) => {
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descrição = req.body.descrição
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

 
    postagem.save().then(() => {
        res.render("admin/postagem_success")
    }).catch((err) => {
        res.send("Ocorreu um erro "+err)
    })
    }).catch((err) => {
        res.send("Ocorreu um erro "+err)
    })
})
router.post("/postagem/deletar", eAdmin, (req, res) => {
    Postagem.remove({_id: req.body.id}).then(() => {
        res.redirect("/admin/postagem")
    }).catch((err) => {
        res.send("erro ao deletar "+err)
    })
})
module.exports = router