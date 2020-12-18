const express = require('express');
const monk = require('monk');
const yup = require('yup');
const { nanoid }  = require('nanoid');
require('dotenv').config();


//Create DB using Monk.
const db = monk(process.env.DB_URI);
//Creating collection variable
const url_short = db.get('short_url');
//Making sure we target the index by name
url_short.createIndex({ slug: 1}, { unique: true });


const app = express();


app.use(express.json());
app.use(express.static('../public'))


//Very quick Schema Using YUP
const schema = yup.object().shape({
    slug: yup.string().trim().matches(/[\w\-]/i),
    url: yup.string().trim().url().required(),

})

//When we get a URL with an ID, we check the DB to see if we have that stored, if we do. We redirect to the URL. if not we tell the user it isnt found
app.get('/:id', async (req, res, next) => {
    const { id: slug } = req.params;
    try {
        const url = await urls.findOne({ slug });
        if (url) {
            res.redirect(url.url);
        }
        res.redirect(`/?error=${slug} not found`)
    } catch (error) {
        res.redirect(`/?error=Link not found`)
    }
})


//Creating a new short URL through the VUE method of CreateUrl()
app.post('/url', async (req, res, next) =>{
    let { slug, url } = req.body;
    try {
        await schema.validate({
            slug,
            url
        })
        //If no 'custom' slug, we make a random 6 digit one for the user.
        if(!slug){
            slug = nanoid(6);
        }else {
            const existing = await url_short.findOne({ slug });
            if (existing) {
                throw new Error('Slug is currently in use')
            }
        }
        slug = slug.toLowerCase();
        const newUrl = {
            url,
            slug
        };
        const created = await url_short.insert(newUrl);
        res.json(created);
    } catch (error) {
        next(error);
    }
});

//Error reports.
app.use((error, req, res, next) => {
    if(error.status) {
        res.status(error.status)
    }else {
        res.status(500);
    }
    res.json({
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? 'Good' : error.stack,
    })
})


//Port information.
const port = process.env.PORT || 4000;
app.listen(port,() => {
    console.log(`listen at port ${port}`)
})