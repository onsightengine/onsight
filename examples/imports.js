/***** Local *****/

// "salt": "../dist/onsight.module.js"
// "suey": "../libs/suey.min.js"

/***** CDN *****/

// "salt": "https://unpkg.com/onsight@x.x.x/dist/onsight.module.js"
// "suey": "https://unpkg.com/suey@x.x.x/dist/suey.min.js"

document.write(`
    <script type='importmap'>
    {
        "imports": {
            "salt": "../dist/onsight.module.js",
            "suey": "../libs/suey.min.js"
        }
    }
    </script>
`);
