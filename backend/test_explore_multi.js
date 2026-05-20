(async () => {
    const s = require('./src/services/exploreService')
    for (const id of [1, 100, 102, 103]) {
        try {
            const r = await s.getExplore(id, null)
            console.log('userId', id, '-> posts:', Array.isArray(r.posts) ? r.posts.length : JSON.stringify(r).slice(0, 80))
        } catch (e) {
            console.error('ERR for', id, e && e.message)
        }
    }
})()
