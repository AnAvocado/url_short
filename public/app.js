

const app = new Vue({
    el: '#app',

    //declare the data fields.
    data: {
        url: '',
        slug: '',
        created: '',
    },
    //set a unique method that is triggered when
    methods: {
        async createUrl() {
            console.log(this.url, this.slug)
            const response = await fetch('/url', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    url: this.url,
                    slug: this.slug
                })
            });
            this.created = await response.json();
        }
    }
})