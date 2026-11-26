'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth-client'

/** Déconnexion de l'admin, partagée par le menu du compte et la feuille « Plus ». */
export function useDeconnexion() {
  const router = useRouter()
  const [enCours, setEnCours] = useState(false)

  const deconnecter = async () => {
    setEnCours(true)
    try {
      await signOut()
      router.push('/login')
      router.refresh()
    } finally {
      setEnCours(false)
    }
  }

  return { deconnecter, enCours }
}
