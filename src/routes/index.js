
const express = require('express');
const router = express.Router();
const pool = require('../database')
const {uploadFile,getFileURL} = require('../lib/s3')
const fs = require('fs-extra')



const { RekognitionClient, CompareFacesCommand } = require("@aws-sdk/client-rekognition");
const  { AWS_BUCKET_REGION, AWS_PUBLIC_KEY_IA, AWS_SECRET_KEY_IA, AWS_BUCKET_NAME } = require('../lib/config')
const client = new RekognitionClient({
    region: AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: AWS_PUBLIC_KEY_IA,
        secretAccessKey: AWS_SECRET_KEY_IA
    }
});
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)

let id_catalogo
let id_fotografo

router.get('/',(req,res)=>{
    res.render('index')
})


//ORGANIZADOR
router.get('/new_catalogo',(req, res)=>{
    res.render('catalogo/new_catalogo')
})
router.post('/new_catalog/:id_catalogo',async(req, res)=>{

   
    const newEvento  ={
        titulo: req.body.titulo,
        fecha: req.body.fecha,
        direccion: req.body.direccion,
        organizador_id: req.body.organizador_id
    }
    const resp1 = await pool.query('INSERT INTO evento SET ?',[newEvento]);

    const newCatalogo = {evento_id: resp1.insertId}
    await pool.query('INSERT INTO catalogo SET ?',[newCatalogo]);

    const Designados = req.body.FotografosDesignados
    Designados.forEach( async (element) => {
         const idFotografo = await pool.query('SELECT id FROM persona WHERE persona.nombre= ?',[element])
        const newAsignado ={
            evento_id : resp1.insertId,
            fotografo_id : idFotografo[0].id
        }
        await pool.query('INSERT INTO asignado SET ?',[newAsignado])
    });


    res.redirect('/perfil/organizador')
})
//ORGANIZADOR

//FOTOGRAFO
router.get('/newphotos', (req, res)=>{
    res.render('photo/newphotos')
})
router.post('/newphotos', async(req, res)=>{
    
    const  fotografias = req.files.photos_fotografo
    const idCatalogo = await pool.query('SELECT catalogo.id from evento,catalogo WHERE evento.id=catalogo.evento_id AND evento.titulo = ?',[req.body.tituloEvento])
    
    fotografias.forEach(async(element) => {
        await uploadFile(element);
        fs.unlinkSync(element.tempFilePath)

        const UrlImage = await getFileURL(element.name)
        const FotoNew = {
            nombre : element.name,
            url : UrlImage,
            catalogo_id : idCatalogo[0].id,
            fotografo_id : req.body.id
        }
        await pool.query('INSERT INTO foto SET ?',[FotoNew])
     });

     id_catalogo = idCatalogo[0].id
     id_fotografo = req.body.id
    res.redirect('perfil/fotografo')
})
router.get('/procesoFotosIa',async(req,res)=>{ 
    const ListaClientes = await pool.query('SELECT * FROM cliente')

    const FotosEvento = await pool.query('SELECT foto.id,foto.nombre FROM foto,catalogo,fotografo WHERE foto.catalogo_id=catalogo.id AND fotografo.id=foto.fotografo_id  AND catalogo.id=?',[id_catalogo])

    ListaClientes.forEach(async (element) => {         
        FotosEvento.forEach(async (e)=>{
            const params = {
                SourceImage: {
                  S3Object: {
                    Bucket: AWS_BUCKET_NAME,
                    Name: e.nombre
                  },
                },
                TargetImage: {
                  S3Object: {
                    Bucket: AWS_BUCKET_NAME,
                    Name: element.nombrefoto
                  },
                },
                SimilarityThreshold: 70
            };
            const command = new CompareFacesCommand(params)
            const resultado = await client.send(command)
            const a = resultado.FaceMatches;
            if (a.length>0) {
                   const NewIa = {
                    foto_id : e.id,
                    cliente_id : element.id
                } 
                   await pool.query('INSERT INTO ia SET ?',[NewIa])
            }
        });
    })

    res.send('ok')
})
router.get('/pago_photo/:id_foto', async(req, res) => {
     const InformacionFoto = await pool
     .query('SELECT catalogo.id id_catalogo,foto.id id_foto,fotografo.id id_fotografo,foto.url,persona.telefono FROM catalogo,foto,persona,fotografo WHERE foto.catalogo_id=catalogo.id AND fotografo.id=foto.fotografo_id AND fotografo.id=persona.id AND foto.id=?',[req.params.id_foto])
   res.render('photo/pago_photo',{InformacionFoto})
})
//FOTOGRAFO

// COMPRA FOTO
router.post('/checkout',async(req, res) => {
    let nombrefoto,precio
    const producto = await pool.query('SELECT * FROM foto WHERE foto.id=?',[req.body.id_foto])    
    producto.forEach((e)=>{
        nombrefoto=e.nombre
    })
    let nombredelItem = ({ items:[{nombre:nombrefoto,precio:30000}]})
   const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: nombredelItem.items.map(item=>{
        return{
            price_data:{
                currency: 'usd',
                product_data:{
                    name:item.nombre
                },
                unit_amount: item.precio
            },
            quantity: 1
        }
    }),
    mode: 'payment',
    success_url: `${process.env.SERVER_URL}/signin`,
    cancel_url: `${process.env.SERVER_URL}/catalogo/4`,
});
    
res.redirect(303, session.url);
    

})
router.post('/comprarFotos',async(req,res)=>{
    const FotosSeleccionadas =  JSON.parse(req.body.FotosSeleccionada)
    let DatosProducto = []
    let itemsBuy = ({ items: DatosProducto})
    for (let index = 0; index < FotosSeleccionadas.length; index++) {
        const element = FotosSeleccionadas[index];
        const producto = await pool.query('SELECT * FROM foto WHERE foto.id=?',[element])    
         producto.forEach((e)=>{
            DatosProducto.push(new Object({nombre:e.nombre,precio:30000}))
        })
    }
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: itemsBuy.items.map(item=>{
            return{
                price_data:{
                    currency: 'usd',
                    product_data:{
                        name:item.nombre
                    },
                    unit_amount: item.precio
                },
                quantity: 1
            }
        }),
        mode: 'payment',
        
        success_url: `${process.env.SERVER_URL}/signin`,
    cancel_url: `${process.env.SERVER_URL}/catalogo/4`,
    });
    
    res.redirect(303, session.url);
})
// COMPRA FOTO


// CATALOGO
router.get('/catalogo/:id_catalogo',async (req, res) => {
    const imagenesCatalogo = await pool
    .query('SELECT foto.id id_foto,foto.url,evento.fecha,persona.nombre FROM catalogo,evento,foto,fotografo,persona WHERE catalogo.evento_id=evento.id AND foto.catalogo_id=catalogo.id AND foto.fotografo_id=fotografo.id AND fotografo.id=persona.id AND catalogo.id=?',[req.params.id_catalogo])
    res.render('catalogo/view_catalogo',{imagenesCatalogo})
})
// CATALOGO


//CLIENTE
router.post('/updateFotoCliente/:ci',async (req, res)=>{
    
    // const resp = await uploadFile(req.files.updatefoto);
    // await  fs.unlinkSync(req.files.updatefoto.tempFilePath)
    res.send('ok')
})
//CLIENTE


module.exports = router;
