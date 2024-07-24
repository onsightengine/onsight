/***** Local *****/

// "salt": "../dist/salinity.module.js"
// "suey": "../libs/suey.min.js"

/***** CDN *****/

// "salt": "https://unpkg.com/@salinity/engine@x.x.x/dist/salinity.module.js"
// "suey": "https://unpkg.com/@salinity/suey@x.x.x/dist/suey.min.js"

document.write(`
    <script type='importmap'>
    {
        "imports": {
            "salt": "../dist/salinity.module.js",
            "suey": "../libs/suey.min.js"
        }
    }
    </script>
`);
