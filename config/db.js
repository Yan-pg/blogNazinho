if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://Yan:<password>@cluster0-qywof.mongodb.net/<dbname>?retryWrites=true&w=majority"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}