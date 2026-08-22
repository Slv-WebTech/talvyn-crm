import { api } from './api.js'

export function getSummary() {
  return api.get('/dashboard/summary').then((res) => res.data)
}

export function getUpcomingFollowUps() {
  return api.get('/dashboard/upcoming-followups').then((res) => res.data)
}

export function getRevenueTrend() {
  return api.get('/dashboard/revenue-trend').then((res) => res.data)
}
