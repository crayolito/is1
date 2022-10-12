const e = require('connect-flash');
const passport = require('passport');
const Strategy = require('passport-local').Strategy
const pool = require('../database')
const helpers = require('../lib/helpers')
const fs = require('fs-extra')
const {uploadFile,getFileURL} = require('../lib/s3')
// INICIAR SESSION
passport.use('local.signin',new Strategy({
  usernameField: 'ci',
  passwordField: 'password',
  passReqToCallback: true
},async(req,ci,password,done)=>{
  console.log(req.body);
   const rows = await pool.query('SELECT * FROM persona WHERE ci = ?', [ci]);
   console.log(rows);
   if(rows.length > 0){
    const user = rows[0]
    const validPassword = await helpers.matchPassword(password, user.password)
    console.log(validPassword);
    if (validPassword){
      console.log('TODO SALIO OK');
      done(null,user)
    }else{
      console.log('PASSWORD INCORRECT');
      done(null,false)
    }
   }else{
    console.log('NO EXISTE EL USUARIO');
    done(null,false)
   }
}))
// INICIAR SESSION


//CLIENTE
passport.use('local.registroCliente', new Strategy({
    usernameField: 'ci',
    passwordField: 'password',   
    passReqToCallback: true,
},async (req,ci,password,done)=>{
    const nameFotoPerfil = req.files.newfotop.name
    await uploadFile(req.files.newfotop);
    fs.unlinkSync(req.files.newfotop.tempFilePath)

    const UrlImage = await getFileURL(req.files.newfotop.name)

    const newPersona = {
        ci,
        nombre : req.body.nombres,
        telefono : req.body.telefono,
        password
    }
    newPersona.password = await helpers.encryptPassword(password);
    const result = await pool.query('INSERT INTO persona SET ?',[newPersona]);
    newPersona.id = result.insertId
    const newCliente = {
        id:result.insertId,
        nombrefoto:req.files.newfotop.name,
        url: UrlImage
    }
     await pool.query('INSERT INTO cliente SET ?',[newCliente]);
     return done(null,newPersona);
}))
//CLIENTE

// ORGANIZADOR
passport.use('local.registroOrganizador', new Strategy({
  usernameField: 'ci',
  passwordField: 'password',   
  passReqToCallback: true,
},async (req,ci,password,done)=>{
  const newPersona = {
      ci,
      nombre : req.body.nombre,
      telefono : req.body.telefono,
      password
  }
  newPersona.password = await helpers.encryptPassword(password);
  const result = await pool.query('INSERT INTO persona SET ?',[newPersona]);
  newPersona.id = result.insertId
  const newOrganizador = {id:result.insertId}
   await pool.query('INSERT INTO organizador SET ?',[newOrganizador]);
   return done(null,newPersona);
}))
// ORGANIZADOR


// FOTOGRAFO
passport.use('local.registroFotografo', new Strategy({
  usernameField: 'ci',
  passwordField: 'password',   
  passReqToCallback: true,
},async (req,ci,password,done)=>{

  const newPersona = {
      ci,
      nombre : req.body.nombre,
      telefono : req.body.telefono,
      password
  }
  newPersona.password = await helpers.encryptPassword(password);
  const result = await pool.query('INSERT INTO persona SET ?',[newPersona]);
  newPersona.id = result.insertId
  const newFotografo = {
    id:result.insertId,
    studio : req.body.studio
  }
   await pool.query('INSERT INTO fotografo SET ?',[newFotografo]);
   return done(null,newPersona);
}))
// FOTOGRAFO


passport.serializeUser((persona, done) => {
    done(null, persona.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    const rows = await pool.query('SELECT * FROM persona WHERE id = ?', [id]);
    done(null, rows[0]);
  });
