import { Todo } from '@/types/todo'
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  Timestamp,
} from "firebase/firestore";

async function fetchDataOnFirestore (userId: string): Promise<Todo[]> {
  const db = getFirestore()
  const docRef = doc(collection(db, 'todos'), userId)
  const snapshot = await getDoc(docRef)
  const data = snapshot.data()

  return (data?.items ?? []).map((x: { createdAt: Timestamp }) => ({
    ...x,
    createdAt: x.createdAt.toDate()
  })) as Todo[]
}

async function saveDataOnFirestore (todoList: Todo[], userId: string): Promise<void> {
  const db = getFirestore()
  const docRef = doc(collection(db, 'todos'), userId)
  await setDoc(docRef, { items: todoList })
}

export function fetchData(userId: string): Promise<Todo[]> {
  let fetchFunction: Promise<Todo[]>;

  fetchFunction = fetchDataOnFirestore(userId);

  return fetchFunction;
}

export function saveData(todoList: Todo[], userId: string): Promise<void> {
  let saveFunction: Promise<void>;

  saveFunction = saveDataOnFirestore(todoList, userId);

  return saveFunction;
}
