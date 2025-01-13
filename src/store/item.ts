import { nanoid } from "nanoid"
import { defineStore } from "pinia"
import { Item } from "@/types/item"
import { arrayMoveImmutable } from "array-move"

import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore"

import { db } from "@/plugins/firebase"

interface State {
  itemList: Item[]
  slotTitleList: string[]
  scriptSlotTitleList: string[]
  slotList: string[]
  scriptItemList: any[]
  title: string
  still_to_come: string
  special_day: string
  birthdays: string
  getScriptListClips: any[]
}

export const useItemStore = defineStore("item", {
  state: (): State => ({
    itemList: [],
    slotTitleList: [],
    scriptSlotTitleList: [],
    slotList: [],
    title: "",
    special_day: "",
    still_to_come: "",
    birthdays: "",
    scriptItemList: [],
    getScriptListClips: [],
  }),
  actions: {
    async addItem(params: Item, podcastname: string, docname: string) {
      const id = nanoid()
      const item: Item = { ...params, id }
      this.itemList.push(item)
      this.saveData(podcastname, docname)
    },
    async addScriptItem(
      params: Item,
      podCastName: string,
      slot: any,
      docname: string,
    ) {
      const id = nanoid()
      const item: any = { params, slot, id }
      this.scriptItemList.push(item)
      this.saveData(podCastName, docname)
    },

    async setItemToSlot(item: any, podcastname: string, docname: string) {
      const slot2: any[] = []
      this.scriptItemList.forEach((element) => {
        if (element.id === item.id) {
          element = item
        }
        slot2.push(element)
      })
      this.scriptItemList = slot2
      this.saveData(podcastname, docname)
    },

    getSlotItem() {
      return this.slotList.filter((item) => item !== null)
    },
    async updateSlotItem(item: [], podcastname: string, docname: string) {
      this.itemList = item
      this.saveData(podcastname, docname)
    },

    async removeDraftItem(item: unknown, destination: string, from: string) {
      const docRef = doc(db, destination, "draft", from, "shares")
      try {
        await updateDoc(docRef, {
          items: arrayRemove(item),
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.log(e)
      }
    },
    async removeItem(item: Item, podcastname: string, docname: string) {
      const docRef = doc(collection(db, podcastname), docname)
      try {
        return await updateDoc(docRef, {
          items: arrayRemove(item),
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (e.code === "not-found" && e.name === "FirebaseError") {
          const index = this.itemList.findIndex((x) => x.id === item.id)

          if (index < 0) throw new Error(`Can't find item [${item.id}]`)

          this.itemList.splice(index, 1)
          //TODO: remove only the individual item
          return this.saveData(podcastname, docname)
        } else throw e
      }
    },
    async updateItem(item: Item, podcastname: string, docname: string) {
      //TODO: update only the individual item
      return this.saveData(podcastname, docname)
    },
    async saveData(podcastname: string, docname: string) {
      const docRef = doc(collection(db, podcastname), docname)
      try {
        return await updateDoc(docRef, {
          items: this.itemList,
          slotTitles: this.slotTitleList,
          scriptSlotTitleList: this.scriptSlotTitleList,
          script: this.scriptItemList,
          still_to_come: this.still_to_come,
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (e.code === "not-found" && e.name === "FirebaseError") {
          return await setDoc(docRef, {
            items: this.itemList,
            slotTitles: this.slotTitleList,
            scriptSlotTitleList: this.scriptSlotTitleList,
            script: this.scriptItemList,
            still_to_come: this.still_to_come,
          })
        } else throw e
      }
    },

    async saveInputSpecialDayData(podcastname: string, data: string) {
      const docRef = doc(collection(db, podcastname), "title")
      try {
        await updateDoc(docRef, {
          special_day: data,
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (e.code === "not-found" && e.name === "FirebaseError") {
          await setDoc(docRef, {
            special_day: data,
          })
        } else throw e
      }
    },
    async saveInputTitleData(podcastname: string, data: string) {
      const docRef = doc(collection(db, podcastname), "title")
      try {
        await updateDoc(docRef, {
          title: data,
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (e.code === "not-found" && e.name === "FirebaseError") {
          await setDoc(docRef, {
            title: data,
          })
        } else throw e
      }
    },
    async saveInputBirthdaysData(podcastname: string, data: string) {
      const docRef = doc(collection(db, podcastname), "title")
      try {
        await updateDoc(docRef, {
          birthdays: data,
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (e.code === "not-found" && e.name === "FirebaseError") {
          await setDoc(docRef, {
            birthdays: data,
          })
        } else throw e
      }
    },
    async moveClipField(
      indexFrom: number,
      position: string,
      podcastname: string,
      slot: number,
      docname: string,
    ) {
      let sortArray = this.scriptItemList.filter((item) => item.slot === slot)
      if (position == "top") {
        sortArray = arrayMoveImmutable(sortArray, indexFrom, indexFrom - 1)
        console.log(sortArray, "topArray")
      } else {
        sortArray = arrayMoveImmutable(sortArray, indexFrom, indexFrom + 1)
        console.log(sortArray, "bottomArray")
      }
      const filteredArray = this.scriptItemList.filter(
        (item) => item.slot != slot,
      )
      sortArray.map((item) => {
        filteredArray.push(item)
      })
      this.scriptItemList = filteredArray
      this.saveData(podcastname, docname)
    },
    async moveScript(
      slot: number,
      position: string,
      podcastname: string,
      docname: string,
    ) {
      if (position == "top" && slot !== 7) {
        this.scriptItemList.map((item) => {
          if (item.slot === slot) {
            item.slot = item.slot + 1
          } else if (item.slot === slot + 1) {
            item.slot = item.slot - 1
          }
        })
      } else if (slot !== 1) {
        this.scriptItemList.map((item) => {
          if (item.slot === slot) {
            item.slot = item.slot - 1
          } else if (item.slot === slot - 1) {
            item.slot = item.slot + 1
          }
        })
      }

      this.saveData(podcastname, docname)
    },
    async deleteScriptClipField(
      id: string,
      podcastname: string,
      docname: string,
    ) {
      let selectedIndex = 0

      this.scriptItemList.map((item, index) => {
        if (item.id === id) {
          selectedIndex = index
        }
      })
      this.scriptItemList.splice(selectedIndex, 1)
      this.saveData(podcastname, docname)
    },
    async deleteScriptClipFieldNew(
      id: string,
      ind: number,
      podcastname: string,
      docname: string,
    ) {
      let selectedIndex = 0
      this.scriptItemList.map((item, index) => {
        if (item.id === id) {
          selectedIndex = index
        }
      })
      this.scriptItemList[selectedIndex].params.splice(ind, 1)
      this.saveData(podcastname, docname)
    },
    connect(podcastname: string, docname: string) {
      onSnapshot(doc(db, podcastname, docname), (doc) => {
        this.slotTitleList = (
          doc.data()?.slotTitles && doc.data()?.slotTitles.length > 0
            ? doc.data()?.slotTitles
            : Array.from({ length: 7 }, () => "") ??
              Array.from({ length: 7 }, () => "")
        ) as string[]
        this.scriptSlotTitleList = (
          doc.data()?.scriptSlotTitleList &&
          doc.data()?.scriptSlotTitleList.length > 0
            ? doc.data()?.scriptSlotTitleList
            : Array.from({ length: 7 }, () => "") ??
              Array.from({ length: 7 }, () => "")
        ) as string[]
        this.itemList = (doc.data()?.items ?? []) as Item[]
        this.scriptItemList = (doc.data()?.script ?? []) as Item[]
        this.still_to_come = doc.data()?.still_to_come ?? ""
      })
    },
  },
  getters: {
    getList: (state: State) => state.itemList,
    getScriptListClips: (state: State) => state.scriptItemList,
    getSlotTitleList: (state: State) => state.slotTitleList,
    getScriptSlotTitleList: (state: State) => state.scriptSlotTitleList,
    getSlotList: (state) => {
      return (slot: number) =>
        state.itemList.filter((item) => item.slot === slot)
    },
    getScriptList: (state) => {
      return (slot: number) =>
        state.scriptItemList.filter((item) => item.slot === slot)
    },
  },
})
