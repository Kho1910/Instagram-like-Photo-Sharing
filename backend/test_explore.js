(async () => {
    try {
        const s = require('./src/services/exploreService')
        const r = await s.getExplore(1, null)
        console.log('OK posts count =', Array.isArray(r.posts) ? r.posts.length : 'no posts')
        if (r.posts && r.posts.length) console.log(r.posts.slice(0, 5))
    } catch (e) {
        console.error('ERR', e && e.message)
        console.error(e)
    }
})()
