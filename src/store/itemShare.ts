import { defineStore } from "pinia"
import { Item } from "@/types/item"
import { usePodcastStore, podcasts } from "@/store/podcasts"
import { db } from "@/plugins/firebase"

import {
  doc,
  setDoc,
  arrayUnion,
  updateDoc,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore"

interface State {
  inbox: { [key: string]: string[] }
}

export const useShareStore = defineStore("share", {
  state: (): State => ({
    inbox: {} as State["inbox"],
  }),
  actions: {
    async connect(podcastname: string) {
      this.inbox = {}
      // TODO: swap this out with a collectionGroup query
      usePodcastStore().getPodcasts.forEach((podcast: podcasts) => {
        onSnapshot(
          doc(db, podcastname, "inbox", podcast.id, "shares"),
          (doc) => {
            this.inbox[podcast.id] = doc.data()?.items ?? []
          },
        )
      })
    },

    async sendItem(item: Item, destination: string, from: string) {
      const docRef = doc(db, destination, "inbox", from, "shares")
      try {
        await updateDoc(docRef, {
          items: arrayUnion(item.text),
        })
        this.connect(from)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        // create doc if it doesn't exist
        if (e.code === "not-found" && e.name === "FirebaseError")
          await setDoc(docRef, { items: arrayUnion(item.text) })
        else throw e
      }
    },

    async removeDraggedItem(item: string, destination: string, from: string) {
      const docRef = doc(db, destination, "inbox", from, "shares")
      await updateDoc(docRef, {
        items: arrayRemove(item),
      })
    },
  },
  getters: {
    getInbox: (state: State) => state.inbox,
  },
})
