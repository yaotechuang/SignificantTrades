import Vue from 'vue'
import store from '@/store'

import VerteDialog from '@/components/ui/picker/VerteDialog.vue'

class DialogService {
  constructor() {
    this.mountedComponents = {}
  }

  createComponent(component, props = {}, resolve = null, dialogId) {
    const Factory = Vue.extend(Object.assign({ store }, component))

    const cmp = new Factory(
      Object.assign(
        {},
        {
          propsData: Object.assign({}, props),
          destroyed: () => {
            if (dialogId) {
              this.mountedComponents[dialogId]--
            }

            if (typeof resolve === 'function') {
              resolve(cmp.output)
            }
          }
        }
      )
    )

    if (dialogId && !this.mountedComponents[dialogId]) {
      this.mountedComponents[dialogId] = 0
    }

    this.mountedComponents[dialogId]++

    return cmp
  }

  async openAsPromise(component, props = {}, dialogId) {
    return new Promise(resolve => {
      component = this.createComponent(component, props, resolve, dialogId)

      this.mountDialog(component)
    })
  }

  open(component, props = {}, dialogId) {
    component = this.createComponent(component, props, null, dialogId)

    this.mountDialog(component)

    return component
  }

  mountDialog(cmp) {
    const container = document.querySelector('[data-app=true]') || document.body
    container.appendChild(cmp.$mount().$el)
  }

  isDialogOpened(name) {
    return !!this.mountedComponents[name]
  }

  openPicker(initialColor, cb) {
    const dialog = this.open(VerteDialog, {
      value: initialColor
    })

    if (typeof cb === 'function') {
      dialog.$on('input', cb)
    }

    return dialog
  }
}

export default new DialogService()