// Carreganod módulos   
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require("body-parser")
    var app = express()
    const admin = require("./routes/admin")
    const path = require("path")
    const mongoose = require("mongoose")
    const session = require("express-session")
    var flash = require('connect-flash');
    require("./models/postagens")
    const Postagem = mongoose.model("postagens")
    require("./models/categoria")
    const Categoria = mongoose.model("categorias")
    const usuarios = require("./routes/usuario")
    const passport = require("passport")
    require("./config/auth")(passport)
    const db = require("./config/db")
// Configurações
    // Sessão

        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }))

        app.use(passport.initialize())
        app.use(passport.session())

        app.use(flash());
     
    // Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("sucess_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null
            next()
        })

    // Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())

    // Handlebars
    app.engine('handlebars', handlebars({defaultLayout: 'main'}));
    app.set('view engine', 'handlebars');

    // Mongoose
    mongoose.Promise = global.Promise/*Evitar alguns erros que pode dar*/ 
    mongoose.connect(db.mongoURI ).then(function(){
        useNewUrlParser: true 
        console.log("Mongo concetado...")
    }).catch(function(err){
        console.log("Ha um erro ao se conectar "+err)
    })

    //  Public
        app.use(express.static(path.join(__dirname, 'public')))
        app.use((req, res, next) => {
            console.log("ola eu sou yan")
            next()
        })
// Rotas"
    app.get('/', (req, res) => {
        Postagem.find().populate("categoria").sort({data: "desc"}).lean().then((postagens) => {
            res.render("index", {postagens: postagens})
        }).catch((err) => {
            res.send("ocorreu um erro "+err)
        })
    })
    /*app.get("/404", (req, res) => {
        res.send("Erro 404")
    })*/
    app.get("/postagem/:slug", (req, res) => {
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
            if(postagem){
                res.render("postagem/index", {postagem: postagem})
            }
            else{
                req.redirect("/")
            }
        }).catch((err) => {
            res.send("ocorreu um erro "+err)
        })
    })

    app.get("/categorias", (req, res) => {
        Categoria.find().lean().then((categorias) => {
            res.render("categorias/index", ({categorias: categorias}))
        }).catch((err) => {
            res.send("Ocorreu um erro ao carregar as categorias "+err)
        })
    })

    app.get("/categorias/:slug", (req, res)=> {
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            if(categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagem) => {
                    res.render("categorias/postagens", {postagem: postagem})
                }).catch((err) => {
                    res.send("ocorreu um erro ao achar postagem "+err)
                })
            } 
            else{
                res.send("Está categoria nao existe")
            }
        }).catch((err) => {
            req.send("Ocorreu um erro "+err)
        })
    })

    app.use('/admin', admin)
    app.use('/usuarios', usuarios)
const PORT = process.env.PORT ||8081
app.listen(PORT, function(){
    console.log("Servidor rodando...")
})