const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const yup = require('yup');
const monk = require('monk');
const { nanoid}  = require('nanoid');
require('dotenv').config();


const db = monk(process.env.DB_URI);
const url_short = db.get('url_short');
url_short.createIndex({ slug: 1}, { unique: true });
const app = express();


app.use(helmet());
app.use(morgan('tiny'))
app.use(cors());
app.use(express.json());
app.use(express.static('../public'))


//Yup is great because it has built in functions that do validations like http and etc.
const schema = yup.object().shape({
    slug: yup.string().trim().matches(/[\w\-]/i),
    url: yup.string().trim().url().required(),

})

app.get('/url/:id', (req, res) => {

})
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

app.post('/url', async (req, res, next) =>{
    let { slug, url} = req.body;

    try {
        await schema.validate({
            slug,
            url,
        })
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
            slug,
        };
        const created = await url_short.insert(newUrl);
        res.json(created);
    } catch (error) {
        next(error);
    }
});

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

const port = process.env.PORT || 4000;
app.listen(port,() => {
    console.log(`listen at port ${port}`)
})