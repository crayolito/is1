const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const session = require('express-session')
const flash = require('connect-flash')
const MysqlStore = require('express-mysql-session');
const {database} = require('./keys');
const passport = require('passport');
const  fileUpload = require('express-fileupload');
const pool = require('./database');
const { log } = require('console');
require('dotenv').config()
require('./lib/config')


// Initializes
const app = express();
require('./lib/passport')

// Settings
app.set('port',process.env.PORT || 8000)
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs',exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'),'layouts'),
    partialsDir: path.join(app.get('views'),'partials'),
    extname: '.hbs',
    helpers : require('./lib/handlebars')
}))
app.set('view engine', '.hbs')

// Middlewares
app.use(session({
    secret: 'is1mysql',
    resave: false,
    saveUninitialized: false,
    store: new MysqlStore(database)
}))

app.use(flash())
app.use(morgan('dev'))
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir: '/uploads'
}))

// Global Variables 
app.use(async(req,res,next)=>{
    //
    const eventosC = await pool.query('SELECT * FROM evento')
    app.locals.eventosC = eventosC
    // console.log(eventosC);
    //
    const fotografos = await pool.query('SELECT nombre FROM persona,fotografo WHERE persona.id=fotografo.id')
    app.locals.fotografos = fotografos
    //
    
    //
    if(req.user){
        //
            
            const FotosIa = await pool.query('SELECT foto.nombre,foto.url FROM cliente,ia,foto WHERE cliente.id=ia.cliente_id AND ia.foto_id=foto.id AND cliente.id=?',[req.user.id])
            app.locals.FotosIa = FotosIa
            
            //
         const esCliente = await pool.query('SELECT * FROM cliente,persona WHERE cliente.id=persona.id AND persona.id=?',[req.user.id])
         const fotoPerfilCliente = await pool.query('SELECT cliente.url FROM cliente,persona WHERE cliente.id=persona.id AND persona.id=?',[req.user.id])
         if(esCliente.length > 0){app.locals.fotoPerfilCliente = fotoPerfilCliente[0].url}
        
        //
        const eventosOrganizador = await pool.query('SELECT evento.id id_evento,catalogo.id id_catalogo,evento.fecha,evento.titulo,evento.direccion FROM evento,organizador,persona,catalogo WHERE catalogo.evento_id=evento.id AND evento.organizador_id=organizador.id AND organizador.id=persona.id AND persona.id=?',[req.user.id])
        app.locals.eventosOrganizador = eventosOrganizador
        
        //
        const cliente = await pool.query('SELECT * FROM cliente WHERE id = ?', [req.user.id]);
    app.locals.cliente = cliente[0]
    
    //
    const organizador = await pool.query('SELECT * FROM organizador WHERE id = ?', [req.user.id]);
    app.locals.organizador = organizador[0]
    //
    const fotografo = await pool.query('SELECT * FROM fotografo WHERE id = ?', [req.user.id]);
    app.locals.fotografo = fotografo[0]
    //
    const FotosDelFotografo = await pool
    .query(
        'SELECT foto.id,foto.nombre,foto.url,evento.titulo FROM persona,foto,fotografo,catalogo,evento  WHERE foto.fotografo_id=fotografo.id AND foto.catalogo_id=catalogo.id AND catalogo.evento_id=evento.id AND persona.id=fotografo.id AND persona.ci=? LIMIT 9',[req.user.ci])
    app.locals.FotosDelFotografo = FotosDelFotografo
    
}
    app.locals.persona = req.user;
    next();
})


// Routes
app.use(require('./routes/index'))
app.use(require('./routes/authentication'))

// Public 

app.use(express.static(path.join(__dirname,'./public')));

// Starting the server
app.listen(app.get('port'),()=>{
    console.log('listening on port '+app.get('port'));
})