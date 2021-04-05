import { ActionTree, MutationTree } from 'vuex'

import DEFAULTS_STATE from './defaultSettings.json'
import { getColorLuminance, splitRgba } from '@/utils/colors'
import { AppModule } from '.'

export type SlippageMode = false | 'price' | 'bps'

export interface SettingsState {
  preferQuoteCurrencySize?: boolean
  calculateSlippage?: SlippageMode
  aggregateTrades?: boolean
  showLogos?: boolean
  showChart?: boolean
  theme?: string
  backgroundColor?: string
  textColor?: string
  timezoneOffset?: number
  showExchangesBar?: boolean
  animateExchangesBar?: boolean
  useAudio?: boolean
  audioIncludeInsignificants?: boolean
  audioVolume?: number
  audioPitch?: number
  settings?: string[]
  recentColors?: string[]
  disableAnimations?: boolean
  decimalPrecision?: number
}

const state = Object.assign(
  {
    _id: 'settings'
  },
  DEFAULTS_STATE
) as SettingsState

const actions = {
  addRecentColor({ commit, state }, newColor) {
    if (state.recentColors.includes(newColor)) {
      return
    }

    if (state.recentColors.length >= 16) {
      commit('TRIM_RECENT_COLORS')
    }

    commit('ADD_RECENT_COLOR', newColor)
  },
  setBackgroundColor({ commit, state }, rgb) {
    commit('SET_CHART_BACKGROUND_COLOR', rgb)

    const backgroundLuminance = getColorLuminance(splitRgba(rgb))
    const theme = backgroundLuminance > 175 ? 'light' : 'dark'

    if (theme !== state.theme) {
      commit('SET_CHART_THEME', theme)
    }

    if (state.textColor.length) {
      commit('SET_CHART_COLOR', '')
    }
  },
  setQuoteCurrencySizing({ commit }, sizeInQuote: boolean) {
    commit('SET_QUOTE_CURRENCY_SIZING', sizeInQuote)

    this.dispatch('app/refreshCurrencies')
  },
  setAudioVolume({ commit, state }, volume: number) {
    commit('SET_AUDIO_VOLUME', volume)

    if (volume && !state.useAudio) {
      commit('TOGGLE_AUDIO', true)
    } else if (!volume && state.useAudio) {
      commit('TOGGLE_AUDIO', false)
    }
  }
} as ActionTree<SettingsState, SettingsState>

const mutations = {
  SET_QUOTE_AS_PREFERED_CURRENCY(state, value) {
    state.preferQuoteCurrencySize = value ? true : false
  },
  TOGGLE_SLIPPAGE(state) {
    const values: SlippageMode[] = [false, 'bps', 'price']

    const index = Math.max(0, values.indexOf(state.calculateSlippage))

    state.calculateSlippage = values[(index + 1) % values.length]
  },
  TOGGLE_AGGREGATION(state, value) {
    state.aggregateTrades = value ? true : false
  },
  TOGGLE_ANIMATIONS(state) {
    state.disableAnimations = !state.disableAnimations
  },
  TOGGLE_SETTINGS_PANEL(state, value) {
    const index = state.settings.indexOf(value)

    if (index === -1) {
      state.settings.push(value)
    } else {
      state.settings.splice(index, 1)
    }
  },
  TOGGLE_AUDIO(state, value) {
    state.useAudio = value ? true : false
  },
  TOGGLE_AUDIO_TEN_PERCENT(state, value) {
    state.audioIncludeInsignificants = value ? true : false
  },
  SET_AUDIO_VOLUME(state, value) {
    state.audioVolume = value
  },
  SET_AUDIO_PITCH(state, value) {
    state.audioPitch = value
  },
  SET_CHART_BACKGROUND_COLOR(state, value) {
    state.backgroundColor = value
  },
  SET_CHART_THEME(state, value) {
    state.theme = value
  },
  SET_CHART_COLOR(state, value) {
    state.textColor = value
  },
  SET_TIMEZONE_OFFSET(state, value) {
    state.timezoneOffset = +value || 0
  },
  TOGGLE_EXCHANGES_BAR(state, value) {
    state.showExchangesBar = value ? true : false
  },
  TOGGLE_EXCHANGES_BAR_ANIMATION(state, value) {
    state.animateExchangesBar = value ? true : false
  },
  ADD_RECENT_COLOR(state, value) {
    state.recentColors.push(value)
  },
  TRIM_RECENT_COLORS(state) {
    state.recentColors.pop()
  },
  SET_DECIMAL_PRECISION(state, value) {
    state.decimalPrecision = value
  }
} as MutationTree<SettingsState>

export default {
  namespaced: true,
  state,
  actions,
  mutations
} as AppModule<SettingsState>