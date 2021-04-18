import { MutationTree, ActionTree, GetterTree, Module } from 'vuex'

import dialogService from '@/services/dialogService'
import StatDialog from '@/components/stats/StatDialog.vue'
import Vue from 'vue'
import { slugify, uniqueName } from '@/utils/helpers'

export interface StatBucket {
  id: string
  name: string
  input: string
  enabled: boolean
  window?: number
  precision?: number
  color?: string
  type?: string
}

export interface StatsPaneState {
  _id?: string
  granularity?: number
  window?: number
  enableChart?: boolean
  buckets?: { [id: string]: StatBucket }
}

const getters = {} as GetterTree<StatsPaneState, StatsPaneState>

const state = {
  granularity: 5000,
  window: 60000,
  enableChart: false,
  buckets: {
    trades: { id: 'trades', name: 'TRADES', input: 'cbuy + csell', enabled: true, color: 'rgba(255, 255, 255, .25)', precision: 2 },
    vold: { id: 'vold', name: 'VOLUME Δ', input: 'vbuy - vsell', enabled: true, color: '#40d745', type: 'area' },
    tradesd: { id: 'tradesd', name: 'TRADES Δ', input: 'cbuy - csell', enabled: true, color: '#2196f3', precision: 2 },
    '1hliq': {
      id: '1hliq',
      name: '1H LIQUIDATIONS Δ',
      window: 3600000,
      input: 'lbuy-lsell',
      enabled: false,
      color: '#e91e63',
      type: 'histogram'
    }
  }
} as StatsPaneState

const actions = {
  createStat({ commit }) {
    const otherIds = Object.keys(state.buckets)
    const otherNames = otherIds.map(id => state.buckets[id].name)

    const name = uniqueName('COUNTER', otherNames)
    const id = uniqueName(slugify(name), otherIds)

    commit('CREATE_BUCKET', { id, name })

    dialogService.open(StatDialog, { id })
  },
  updateStat({ commit, state }, { id, prop, value }) {
    if (state.buckets[id][prop] === value) {
      return
    }

    let mutation = ''

    if (typeof value === 'boolean') {
      mutation += 'TOGGLE_BUCKET'
    } else {
      mutation += 'SET_BUCKET_' + prop.toUpperCase()
    }

    commit(mutation, {
      id,
      value
    })
  },
  renameStat({ commit, state }, { id, name }) {
    const otherIds = Object.keys(state.buckets).filter(_id => _id !== id)
    const otherNames = otherIds.map(id => state.buckets[id].name)

    const oldId = id

    name = uniqueName(name, otherNames)
    id = uniqueName(slugify(name), otherIds)

    commit('RENAME_BUCKET', {
      oldId,
      id,
      name
    })
  }
} as ActionTree<StatsPaneState, StatsPaneState>

const mutations = {
  TOGGLE_BUCKET(state, { id, value }) {
    const stat = state.buckets[id]

    stat.enabled = value ? true : false

    Vue.set(state.buckets, id, stat)
  },
  SET_BUCKET_INPUT(state, { id, value }) {
    const stat = state.buckets[id]

    stat.input = value

    Vue.set(state.buckets, id, stat)
  },
  RENAME_BUCKET(state, { oldId, id, name }) {
    const stat = state.buckets[oldId]

    stat.name = name
    stat.id = id

    Vue.delete(state.buckets, oldId)
    Vue.set(state.buckets, id, stat)
  },
  SET_BUCKET_COLOR(state, { id, value }) {
    const stat = state.buckets[id]

    stat.color = value

    Vue.set(state.buckets, id, stat)
  },
  SET_BUCKET_PRECISION(state, { id, value }) {
    const stat = state.buckets[id]

    value = parseInt(value)

    stat.precision = !isNaN(value) ? value : null

    Vue.set(state.buckets, id, stat)
  },
  SET_BUCKET_WINDOW(state, { id, value }) {
    const stat = state.buckets[id]
    let milliseconds = parseInt(value)

    if (isNaN(milliseconds)) {
      stat.window = null
    } else {
      if (/[\d.]+s/.test(value)) {
        milliseconds *= 1000
      } else if (/[\d.]+h/.test(value)) {
        milliseconds *= 1000 * 60 * 60
      } else {
        milliseconds *= 1000 * 60
      }

      stat.window = milliseconds
    }

    Vue.set(state.buckets, id, stat)
  },
  CREATE_BUCKET(state, { id, name }) {
    state.buckets[id] = {
      id,
      name,
      input: 'vbuy + vsell',
      enabled: true
    }
  },
  REMOVE_BUCKET(state, id) {
    Vue.delete(state.buckets, id)
  },
  SET_WINDOW(state, value) {
    let milliseconds = parseInt(value) || 0

    if (/[\d.]+s/.test(value)) {
      milliseconds *= 1000
    } else if (/[\d.]+h/.test(value)) {
      milliseconds *= 1000 * 60 * 60
    } else {
      milliseconds *= 1000 * 60
    }

    state.window = milliseconds
  },
  TOGGLE_CHART(state, value) {
    state.enableChart = value ? true : false
  }
} as MutationTree<StatsPaneState>

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
} as Module<StatsPaneState, StatsPaneState>
