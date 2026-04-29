import express from 'express'
import axios from 'axios'

const router = express.Router()

const CF_BASE = 'https://codeforces.com/api'

router.get('/avatar', async (req, res) => {
  try {
    const { url } = req.query
    if (!url) return res.status(400).send('No URL provided')
    const response = await axios.get(decodeURIComponent(url), { 
      responseType: 'arraybuffer' 
    })
    const contentType = response.headers['content-type']
    res.set('Content-Type', contentType)
    res.set('Cache-Control', 'public, max-age=86400')
    res.send(response.data)
  } catch (err) {
    res.status(404).send('Image not found')
  }
})


router.get('/user/:handle/problems-by-tag/:tag', async (req, res, next) => {
  const { handle, tag } = req.params
  try {
    const [statusRes] = await Promise.all([
      axios.get(`${CF_BASE}/user.status?handle=${handle}&from=1&count=10000`)
    ])

    if (statusRes.data.status !== 'OK') {
      return res.status(404).json({ message: 'Handle not found' })
    }

    const submissions = statusRes.data.result
    const solved = new Map()

    for (const sub of submissions) {
      if (sub.verdict === 'OK') {
        const key = `${sub.problem.contestId}-${sub.problem.index}`
        if (!solved.has(key)) solved.set(key, sub.problem)
      }
    }

    const filtered = Array.from(solved.values())
      .filter(p => p.tags && p.tags.includes(tag))
      .map(problem => ({
        contestId: problem.contestId,
        index: problem.index,
        name: problem.name,
        rating: problem.rating || null,
        tags: problem.tags || [],
        url: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`
      }))
      .sort((a, b) => (a.rating || 0) - (b.rating || 0))

    res.json({
      tag,
      count: filtered.length,
      problems: filtered
    })
  } catch (err) {
    next(err)
  }
})


router.get('/user/:handle/problems-by-rating/:rating', async (req, res, next) => {
  const { handle, rating } = req.params
  try {
    const [statusRes] = await Promise.all([
      axios.get(`${CF_BASE}/user.status?handle=${handle}&from=1&count=10000`)
    ])

    if (statusRes.data.status !== 'OK') {
      return res.status(404).json({ message: 'Handle not found' })
    }

    const submissions = statusRes.data.result
    const solved = new Map()

    for (const sub of submissions) {
      if (sub.verdict === 'OK') {
        const key = `${sub.problem.contestId}-${sub.problem.index}`
        if (!solved.has(key)) solved.set(key, sub.problem)
      }
    }

    const filtered = Array.from(solved.values())
      .filter(p => p.rating && String(p.rating) === String(rating))
      .map(problem => ({
        contestId: problem.contestId,
        index: problem.index,
        name: problem.name,
        rating: problem.rating || null,
        tags: problem.tags || [],
        url: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    res.json({
      rating,
      count: filtered.length,
      problems: filtered
    })
  } catch (err) {
    next(err)
  }
})


router.get('/problems', async (req, res, next) => {
  try {
    const response = await axios.get(`${CF_BASE}/problemset.problems`)
    const { problems } = response.data.result
    res.json(problems)
  } catch (err) {
    next(err)
  }
})


// Returns problems sorted by difficulty (rating) for structured learning
router.get('/roadmap', async (req, res, next) => {
  const { topic, handle } = req.query
  if (!topic) {
    return res.status(400).json({ message: 'Topic parameter required' })
  }

  try {
    const response = await axios.get(`${CF_BASE}/problemset.problems`)
    let allProblems = response.data.result.problems || []

    let solvedProblems = new Set()
    if (handle) {
      try {
        const statusRes = await axios.get(`${CF_BASE}/user.status?handle=${handle}&from=1&count=10000`)
        if (statusRes.data.status === 'OK') {
          for (const sub of statusRes.data.result) {
            if (sub.verdict === 'OK') {
              const problemKey = `${sub.problem.contestId}-${sub.problem.index}`
              solvedProblems.add(problemKey)
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch user submissions for roadmap:', err.message)

      }
    }

    const filtered = allProblems
      .filter(p => p.tags && p.tags.includes(topic.toLowerCase()))
      .filter(p => !solvedProblems.has(`${p.contestId}-${p.index}`))
      .map(problem => ({
        contestId: problem.contestId,
        index: problem.index,
        name: problem.name,
        rating: problem.rating || 0,
        tags: problem.tags || [],
        url: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`
      }))
      .sort((a, b) => a.rating - b.rating)

    res.json({
      topic,
      handle: handle || null,
      totalProblems: filtered.length,
      roadmap: filtered.slice(0, 50) // Return top 50 problems for manageability
    })
  } catch (err) {
    next(err)
  }
})


router.get('/user/:handle', async (req, res) => {
  const { handle } = req.params
  try {
    const [statusRes, infoRes] = await Promise.all([
      axios.get(`${CF_BASE}/user.status?handle=${handle}&from=1&count=10000`),
      axios.get(`${CF_BASE}/user.info?handles=${handle}`)
    ])

    if (statusRes.data.status !== 'OK') {
      return res.status(404).json({ message: 'Handle not found' })
    }

    const submissions = statusRes.data.result
    const userInfo    = infoRes.data.result[0]

    const solved = new Map()
    for (const sub of submissions) {
      if (sub.verdict === 'OK') {
        const key = `${sub.problem.contestId}-${sub.problem.index}`
        if (!solved.has(key)) solved.set(key, sub.problem)
      }
    }

    const tagCount = {}
    for (const problem of solved.values()) {
      for (const tag of problem.tags) {
        tagCount[tag] = (tagCount[tag] || 0) + 1
      }
    }

    const ratingCount = {}
    for (const problem of solved.values()) {
      if (problem.rating) {
        const bucket = String(problem.rating)
        ratingCount[bucket] = (ratingCount[bucket] || 0) + 1
      }
    }

    const solvedProblems = Array.from(solved.values()).map(problem => ({
      contestId: problem.contestId,
      index: problem.index,
      name: problem.name,
      rating: problem.rating || null,
      tags: problem.tags || [],
      url: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`
    }))

    res.json({
      handle,
      userInfo: {
        rating:    userInfo.rating    || 0,
        maxRating: userInfo.maxRating || 0,
        rank:      userInfo.rank      || 'unrated',
        avatar:    userInfo.titlePhoto,
        memberSince: userInfo.registrationTimeSeconds ? new Date(userInfo.registrationTimeSeconds * 1000).getFullYear() : null,
        contribution: userInfo.contribution || 0,
      },
      totalSolved: solved.size,
      tagCount,
      ratingCount,
      solvedProblems,
    })
  } catch (err) {
    next(err)
  }
})

export default router
