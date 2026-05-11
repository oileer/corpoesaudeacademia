import { adminDb } from '@/lib/firebase-admin'
import { Workout, Exercise } from '@/types'
import { Timestamp } from 'firebase-admin/firestore'

export async function listWorkouts(studentId: string): Promise<Workout[]> {
  const snap = await adminDb
    .collection('students')
    .doc(studentId)
    .collection('workouts')
    .orderBy('createdAt', 'desc')
    .get()
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Workout))
}

export async function getWorkout(studentId: string, workoutId: string): Promise<Workout | null> {
  const doc = await adminDb
    .collection('students').doc(studentId)
    .collection('workouts').doc(workoutId)
    .get()
  if (!doc.exists) return null
  return { id: doc.id, ...doc.data() } as Workout
}

export async function createWorkout(studentId: string, data: Omit<Workout, 'id' | 'studentId' | 'createdAt' | 'updatedAt'>): Promise<Workout> {
  const now = Timestamp.now()
  const ref = adminDb.collection('students').doc(studentId).collection('workouts').doc()
  const workout: Omit<Workout, 'id'> = {
    ...data,
    studentId,
    createdAt: now.toDate().toISOString(),
    updatedAt: now.toDate().toISOString(),
  }
  await ref.set(workout)
  return { id: ref.id, ...workout }
}

export async function updateWorkout(studentId: string, workoutId: string, data: Partial<Workout>): Promise<void> {
  await adminDb
    .collection('students').doc(studentId)
    .collection('workouts').doc(workoutId)
    .update({ ...data, updatedAt: new Date().toISOString() })
}

export async function deleteWorkout(studentId: string, workoutId: string): Promise<void> {
  await adminDb
    .collection('students').doc(studentId)
    .collection('workouts').doc(workoutId)
    .delete()
}
