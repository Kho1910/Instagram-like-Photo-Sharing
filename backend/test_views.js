(async () => {
    try {
        const prisma = require('./src/config/db')
        const rows = await prisma.views.findMany({ where: { viewer_id: 1 } })
        console.log('views count for 1 =', rows.length)
        if (rows.length) console.log(rows.slice(0, 10))
    } catch (e) { console.error(e) }
})()
