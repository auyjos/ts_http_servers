import { db } from '../index.js'
import { NewChirp, Chirp, chirps } from '../schema/chirpsSchema.js'
import { asc, eq } from 'drizzle-orm'

export async function createChirp(chirp: NewChirp) {

    const [result] = await db.insert(chirps).values(chirp).returning()
    return result

}


export async function getAllChirps() {

    const result = await db.select().from(chirps).orderBy(asc(chirps.createdAt))
    return result;
}

export async function getChirp(id: string) {

    const [result] = await db.select().from(chirps).where(eq(chirps.id, id))
    return result

}

export async function deleteChirps(id: string) {

    const [result] = await db.delete(chirps).where(eq(chirps.id, id))
        .returning()
    return result;
}