import { defineStore } from "pinia"
import { Item } from "@/types/item"
import { usePodcastStore, podcasts } from "@/store/podcasts"
import { db } from "@/plugins/firebase"

import {
  doc,
  setDoc,
  arrayUnion,
  updateDoc,
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

    async sendItem(item: Item, destination: [], from: string) {
      destination.forEach(async (podcast) => {
        const docRef = doc(db, podcast, "inbox", from, "shares")
        try {
          await updateDoc(docRef, {
            items: arrayUnion(item.text),
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          // create doc if it doesn't exist
          if (e.code === "not-found" && e.name === "FirebaseError")
            await setDoc(docRef, { items: arrayUnion(item.text) })
          else throw e
        }
      })
      this.connect(from)
    },
  },
  getters: {
    getInbox: (state: State) => Object.values(state.inbox).flat(),
  },
})
