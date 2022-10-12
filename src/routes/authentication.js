const { request } = require('express');
const express = require('express');
const router = express.Router();
const passport = require('passport');
const pool = require('../database');



// INICAR SESION
router.get('/signin', function (req, res) {
 res.render('index')
})
router.post('/signin', function (req, res, next) {
    console.log(req.body);
    let perfilSignin ;
    if(req.body.ingresar === '1'){
        perfilSignin = '/perfil/organizador'
    }
    if(req.body.ingresar === '2'){
        perfilSignin = '/perfil/fotografo'
    }
    if(req.body.ingresar === '3'){
        perfilSignin = '/perfil/cliente'
    }

    passport.authenticate('local.signin',{
        successRedirect: perfilSignin,
        failureRedirect: '/signin',
    })(req,res,next);
})
// INICAR SESION


// Cliente
//  VIEW Registro Cliente 
router.get('/registro/cliente', (req, res) => {
    res.render('usuario/registro/cliente');
  });
// CREATE Registro Cliente 
router.post('/registro/cliente',passport.authenticate('local.registroCliente',{
    successRedirect: '/perfil/cliente',
    failureRedirect: '/registro/cliente',
}))
// PERFIL Cliente
router.get('/perfil/cliente',(req, res)=>{
    res.render('usuario/perfil/cliente')
})
// Cliente


// Fotografo
//  VIEW Registro Fotografo 
router.get('/registro/fotografo', (req, res) => {
    res.render('usuario/registro/fotografo');
  });
// CREATE Registro Fotografo 
router.post('/registro/fotografo',passport.authenticate('local.registroFotografo',{
    successRedirect: '/perfil/fotografo',
    failureRedirect: '/registro/fotografo',
}))
// PERFIL Fotografo
router.get('/perfil/fotografo',async(req, res)=>{
    res.render('usuario/perfil/fotografo',)
})
router.post('/perfil/fotografo/:id',async(req,res)=>{

    res.render('usuario/perfil/fotografo',{FotosDelFotografo})
})
// Fotografo


// Organizador
//  VIEW Registro Organizador 
router.get('/registro/organizador', (req, res) => {
    res.render('usuario/registro/organizador');
  });
// CREATE Registro Organizador 
router.post('/registro/organizador',passport.authenticate('local.registroOrganizador',{
    successRedirect: '/perfil/organizador',
    failureRedirect: '/registro/organizador',
}))
// PERFIL Organizador
router.get('/perfil/organizador',(req, res)=>{
    res.render('usuario/perfil/organizador')
})
// Organizador


router.get('/cerrar_session', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/signin');
      });
})

module.exports = router;