(async () => {
    try {
        const prisma = require('./src/config/db')
        const fs = require('fs')
        const arr = await prisma.follows.findMany({ where: { follower_id: 1 } })
        console.log('follows count for 1 =', arr.length)
        console.log(arr.map(a => ({ follower_id: a.follower_id, following_id: a.following_id })))
    } catch (e) { console.error(e) }
})()
