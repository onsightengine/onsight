/***** Local *****/

// "salt": "../dist/salinity.module.js"
// "suey": "../../suey/dist/suey.module.js"

/***** CDN *****/

// "salt": "https://unpkg.com/@salinity/engine@x.x.x/dist/salinity.module.js"
// "suey": "https://unpkg.com/@salinity/suey@x.x.x/dist/suey.module.js"

document.write(`
    <script type='importmap'>
    {
        "imports": {
            "salt": "../dist/salinity.module.js",
            "suey": "../../suey/dist/suey.module.js"
        }
    }
    </script>
`);
